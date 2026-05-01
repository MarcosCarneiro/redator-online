import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { userRepository } from '@/db/repositories/user.repository';

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const dbUser = await userRepository.getById(session.user.id);

        if (!dbUser || !dbUser.customerId) {
            return NextResponse.json(
                { error: 'Você ainda não possui uma assinatura ativa ou histórico de pagamentos.' },
                { status: 400 }
            );
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: dbUser.customerId,
            return_url: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/billing`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error: unknown) {
        console.error('Stripe Portal Error:', error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: 'Erro ao conectar com o portal de pagamentos.' },
            { status: 500 }
        );
    }
}
