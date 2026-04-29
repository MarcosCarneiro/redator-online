import { NextResponse } from 'next/server';
import { db } from '@/db';
import { user as userTable, plans as plansTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

function verifySignature(req: Request, body: any, dataId: string): boolean {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    if (!secret) return true; // Skip validation if secret is not set (not recommended for production)

    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');

    if (!xSignature || !xRequestId || !dataId) return false;

    // 1. Extract ts and v1 from x-signature header
    const parts = xSignature.split(',');
    let ts = '';
    let hash = '';

    parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key === 'ts') ts = value;
        if (key === 'v1') hash = value;
    });

    if (!ts || !hash) return false;

    // 2. Build the manifest string (dataId must be lowercase)
    const manifest = `id:${String(dataId).toLowerCase()};request-id:${xRequestId};ts:${ts};`;

    // 3. Generate HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const sha = hmac.digest('hex');

    return sha === hash;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, data } = body;
        const resourceId = data?.id || body.id;

        if (!resourceId) {
            return NextResponse.json({ received: true });
        }

        // Security: Verify the request is actually from Mercado Pago
        if (!verifySignature(req, body, resourceId)) {
            console.error('Mercado Pago Webhook: Invalid Signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        console.log('Mercado Pago Webhook Verified:', JSON.stringify(body, null, 2));

        // Logic for Subscriptions (PreApproval)
        if (type === 'subscription_preapproval' || type === 'preapproval') {
            const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${resourceId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                }
            });

            if (mpResponse.ok) {
                const subscription = await mpResponse.json();

                const safeSubscriptionLog = {
                    ...subscription,
                    payer_email: subscription.payer_email ? '***@***.***' : undefined,
                    payer: subscription.payer ? { ...subscription.payer, email: '***@***.***', identification: '***' } : undefined,
                    card_id: subscription.card_id ? '***' : undefined,
                };
                console.log('Mercado Pago Webhook - Subscription Payload:', JSON.stringify(safeSubscriptionLog, null, 2));

                const userId = subscription.external_reference;
                const status = subscription.status; // 'authorized', 'paused', 'cancelled'
                const planId = subscription.preapproval_plan_id;

                if (userId) {
                    if (status === 'authorized') {
                        const plan = await db.query.plans.findFirst({
                            where: eq(plansTable.mercadopagoPlanId, planId)
                        });

                        await db.update(userTable).set({
                            subscriptionStatus: 'active',
                            subscriptionId: subscription.id,
                            planId: plan?.id || null,
                            subscriptionExpiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
                            essaysUsed: 0,
                        }).where(eq(userTable.id, userId));
                    } else if (status === 'cancelled' || status === 'paused') {
                        await db.update(userTable).set({
                            subscriptionStatus: status === 'cancelled' ? 'canceled' : 'past_due',
                        }).where(eq(userTable.id, userId));
                    }
                }
            }
        }

        // Logic for Payments (Recurring)
        if (type === 'payment') {
            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                }
            });

            if (mpResponse.ok) {
                const payment = await mpResponse.json();

                const safePaymentLog = {
                    ...payment,
                    payer: payment.payer ? { ...payment.payer, email: '***@***.***', identification: '***' } : undefined,
                    card: payment.card ? { ...payment.card, first_six_digits: '***', last_four_digits: '***', cardholder: { name: '***' } } : undefined,
                    transaction_details: payment.transaction_details ? { ...payment.transaction_details, bank_transfer_id: '***' } : undefined,
                };
                console.log('Mercado Pago Webhook - Payment Payload:', JSON.stringify(safePaymentLog, null, 2));

                const userId = payment.external_reference;
                
                if (userId && payment.status === 'approved') {
                    // Update user's quota and expiration for the new month
                    await db.update(userTable).set({
                        subscriptionStatus: 'active',
                        subscriptionExpiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
                        essaysUsed: 0,
                    }).where(eq(userTable.id, userId));
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ received: true, error: error.message });
    }
}
