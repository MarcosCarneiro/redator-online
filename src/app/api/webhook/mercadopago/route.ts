import { NextResponse } from 'next/server';
import { db } from '@/db';
import { user as userTable, plans as plansTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Mercado Pago Webhook Received:', JSON.stringify(body, null, 2));

        const { type, action, data } = body;
        const resourceId = data?.id || body.id;

        if (!resourceId) {
            return NextResponse.json({ received: true });
        }

        // Logic for Subscriptions (PreApproval)
        if (type === 'subscription_preapproval' || type === 'preapproval') {
            // Fetch the full subscription object from Mercado Pago
            const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${resourceId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                }
            });

            if (mpResponse.ok) {
                const subscription = await mpResponse.json();
                const userId = subscription.external_reference;
                const status = subscription.status; // 'authorized', 'paused', 'cancelled'
                const planId = subscription.preapproval_plan_id;

                console.log(`Subscription Sync: User ${userId}, Status ${status}`);

                if (userId && status === 'authorized') {
                    // Find internal plan ID by matching MP Plan ID
                    const plan = await db.query.plans.findFirst({
                        where: eq(plansTable.mercadopagoPlanId, planId)
                    });

                    // Update user status and credits
                    await db.update(userTable).set({
                        subscriptionStatus: 'active',
                        subscriptionId: subscription.id,
                        planId: plan?.id || null,
                        subscriptionExpiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000), // +31 days
                        essaysUsed: 0, // Reset credits for the new month
                    }).where(eq(userTable.id, userId));
                }
            }
        }

        // Logic for Individual Payments (In case of non-subscription or manual sync)
        if (type === 'payment') {
             const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                }
            });
            
            if (mpResponse.ok) {
                const payment = await mpResponse.json();
                const userId = payment.external_reference;
                if (userId && payment.status === 'approved') {
                    // Similar logic can be applied here for simple payments
                    console.log(`Payment Approved for user: ${userId}`);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        // Always return 200 to Mercado Pago to stop retries, even if our internal logic fails
        // but log the error for us.
        return NextResponse.json({ received: true, error: error.message });
    }
}
