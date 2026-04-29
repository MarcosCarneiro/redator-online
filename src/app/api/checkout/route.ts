import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { plans as plansTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

        if (!plan || !plan.mercadopagoPlanId) {
            return NextResponse.json({ error: 'Plano inválido ou não configurado no Mercado Pago' }, { status: 400 });
        }

        // Direct Fetch to Mercado Pago API to avoid SDK hidden fields
        const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                preapproval_plan_id: plan.mercadopagoPlanId,
                reason: `Assinatura ${plan.name}`,
                external_reference: session.user.id,
                payer_email: session.user.email,
                back_url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/checkout/success`,
                status: 'pending',
            }),
        });

        const data = await mpResponse.json();

        // Safely log the payload to inspect why we get a 400, masking email if present
        const safeLogData = {
            ...data,
            payer_email: data.payer_email ? '***@***.***' : undefined,
        };
        console.info('Mercado Pago Preapproval Response Payload:', JSON.stringify(safeLogData));

        if (!mpResponse.ok) {
            console.error('Mercado Pago API Error Details:', safeLogData);
            
            // Fallback: If the API refuses to create a pending subscription without a card,
            // we construct the hosted checkout URL manually using the Plan ID.
            // This is the "Checkout Pro" way for Subscriptions.
            const checkoutUrl = `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${plan.mercadopagoPlanId}&external_reference=${session.user.id}`;
            return NextResponse.json({ init_point: checkoutUrl });
        }

        const initPoint = process.env.NODE_ENV === 'development' 
            ? data.sandbox_init_point || data.init_point 
            : data.init_point;

        return NextResponse.json({ init_point: initPoint });
    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: 'Erro ao processar o checkout.' }, { status: 500 });
    }
}
