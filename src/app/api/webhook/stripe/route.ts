import { NextResponse } from 'next/server';
import { db } from '@/db';
import { user as userTable, plans as plansTable, webhookLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
    let logId: string | undefined;
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('Missing stripe-signature or STRIPE_WEBHOOK_SECRET');
        }
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error: any) {
        console.error('Stripe Webhook Signature Error:', error.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        const resourceId = event.data.object && 'id' in event.data.object ? String((event.data.object as any).id) : null;
        
        // Initial Log Entry
        const [insertedLog] = await db.insert(webhookLogs).values({
            provider: 'stripe',
            type: event.type,
            source: 'webhook',
            resourceId: resourceId,
            payload: event as any,
            status: 'received',
        }).returning({ id: webhookLogs.id });
        logId = insertedLog.id;

        // Extract metadata or client_reference_id where applicable
        let userId: string | null = null;
        const stripeObject: any = event.data.object;

        if (stripeObject.client_reference_id) {
            userId = stripeObject.client_reference_id;
        } else if (stripeObject.metadata?.userId) {
            userId = stripeObject.metadata.userId;
        }

        // We can also retrieve the user if they have a customer ID
        if (!userId && stripeObject.customer) {
            const customerUser = await db.query.user.findFirst({
                where: eq(userTable.customerId, stripeObject.customer as string)
            });
            if (customerUser) {
                userId = customerUser.id;
            }
        }

        if (userId) {
            await db.update(webhookLogs).set({ userId }).where(eq(webhookLogs.id, logId));
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.mode === 'subscription' && userId) {
                    const subscriptionId = session.subscription as string;
                    const customerId = session.customer as string;
                    
                    const planId = session.metadata?.planId;
                    let internalPlanId = null;

                    if (planId) {
                        const plan = await db.query.plans.findFirst({
                            where: eq(plansTable.id, planId)
                        });
                        internalPlanId = plan?.id || null;
                    }

                    await db.update(userTable).set({
                        subscriptionStatus: 'active',
                        subscriptionId: subscriptionId,
                        customerId: customerId,
                        planId: internalPlanId,
                        subscriptionExpiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000), // Approximate next billing
                        essaysUsed: 0,
                    }).where(eq(userTable.id, userId));
                }
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                if (invoice.subscription && userId) {
                    const subscription: any = await stripe.subscriptions.retrieve(invoice.subscription);
                    
                    if (!subscription.current_period_end) {
                        console.error('Stripe Webhook: Subscription has no current_period_end', subscription.id);
                        break;
                    }

                    const expiresAt = new Date(subscription.current_period_end * 1000);
                    
                    await db.update(userTable).set({
                        subscriptionStatus: 'active',
                        subscriptionExpiresAt: expiresAt,
                        essaysUsed: 0,
                    }).where(eq(userTable.id, userId));
                }
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                
                if (!userId && subscription.customer) {
                     const customerUser = await db.query.user.findFirst({
                        where: eq(userTable.customerId, subscription.customer as string)
                    });
                    if (customerUser) {
                        userId = customerUser.id;
                    }
                }

                if (userId) {
                    const status = subscription.status; // 'active', 'past_due', 'canceled', etc
                    let dbStatus = 'active';
                    if (status === 'canceled') dbStatus = 'canceled';
                    if (status === 'past_due' || status === 'unpaid') dbStatus = 'past_due';

                    const expiresAt = subscription.current_period_end 
                        ? new Date(subscription.current_period_end * 1000)
                        : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

                    await db.update(userTable).set({
                        subscriptionStatus: dbStatus,
                        subscriptionExpiresAt: expiresAt,
                    }).where(eq(userTable.id, userId));
                }
                break;
            }
        }

        // Mark as processed
        if (logId) {
            await db.update(webhookLogs).set({ status: 'processed' }).where(eq(webhookLogs.id, logId));
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook Handling Error:', error);
        if (logId) {
            await db.update(webhookLogs).set({ 
                status: 'error', 
                errorMessage: error.message 
            }).where(eq(webhookLogs.id, logId));
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
