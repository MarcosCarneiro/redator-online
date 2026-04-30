import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { plans as plansTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId } = await req.json();
        const plan = await db.query.plans.findFirst({
            where: eq(plansTable.id, planId)
        });

        if (!plan || !plan.stripePriceId) {
            return NextResponse.json({ error: 'Plano inválido ou não configurado no Stripe' }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: session.user.email,
            client_reference_id: session.user.id,
            line_items: [
                {
                    price: plan.stripePriceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/#planos`,
            metadata: {
                userId: session.user.id,
                planId: plan.id,
            }
        });

        if (!checkoutSession.url) {
            throw new Error('Não foi possível criar a sessão de checkout no Stripe.');
        }

        return NextResponse.json({ init_point: checkoutSession.url });
    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: 'Erro ao processar o checkout.' }, { status: 500 });
    }
}
