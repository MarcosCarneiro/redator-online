import { NextResponse } from 'next/server';
import { userRepository } from '@/db/repositories/user.repository';
import { planRepository } from '@/db/repositories/plan.repository';
import { webhookRepository } from '@/db/repositories/webhook.repository';
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Stripe Webhook Signature Error:', message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        const resourceId = event.data.object && 'id' in event.data.object ? String(event.data.object.id) : null;
        
        logId = await webhookRepository.createLog({
            provider: 'stripe',
            type: event.type,
            source: 'webhook',
            resourceId: resourceId,
            payload: event as unknown as Record<string, unknown>,
            status: 'received',
        });

        let userId: string | null = null;
        const stripeObject = event.data.object as (Stripe.Checkout.Session | Stripe.Subscription | Stripe.Invoice) & { client_reference_id?: string; customer?: string; metadata?: { userId?: string } };

        if (stripeObject.client_reference_id) {
            userId = stripeObject.client_reference_id;
        } else if (stripeObject.metadata?.userId) {
            userId = stripeObject.metadata.userId;
        }

        if (!userId && stripeObject.customer) {
            const customerUser = await userRepository.getByCustomerId(stripeObject.customer);
            if (customerUser) {
                userId = customerUser.id;
            }
        }

        if (userId) {
            await webhookRepository.updateLog(logId, { userId });
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
                        const plan = await planRepository.getById(planId);
                        internalPlanId = plan?.id || null;
                    }

                    await userRepository.updateSubscription(userId, {
                        subscriptionStatus: 'active',
                        subscriptionId: subscriptionId,
                        customerId: customerId,
                        planId: internalPlanId,
                        subscriptionExpiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
                        resetEssays: true,
                    });
                }
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                if (invoice.subscription && userId) {
                    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string) as any;
                    
                    if (!subscription.current_period_end) {
                        console.error('Stripe Webhook: Subscription has no current_period_end', subscription.id);
                        break;
                    }

                    const expiresAt = new Date(subscription.current_period_end * 1000);
                    const dbUser = await userRepository.getById(userId);
                    
                    let shouldReset = true;
                    if (dbUser && dbUser.subscriptionExpiresAt) {
                        const currentExpiresAt = new Date(dbUser.subscriptionExpiresAt);
                        const diffTime = Math.abs(expiresAt.getTime() - currentExpiresAt.getTime());
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);
                        
                        // Avoid resetting credits if this billing cycle was already processed
                        // (e.g., from checkout.session.completed or duplicate webhooks)
                        if (diffDays <= 5) {
                            shouldReset = false;
                        }
                    }
                    
                    await userRepository.updateSubscription(userId, {
                        subscriptionStatus: 'active',
                        subscriptionExpiresAt: expiresAt,
                        resetEssays: shouldReset,
                    });
                }
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                
                if (!userId && subscription.customer) {
                    const customerUser = await userRepository.getByCustomerId(subscription.customer as string);
                    if (customerUser) {
                        userId = customerUser.id;
                    }
                }

                if (userId) {
                    const status = subscription.status;
                    let dbStatus = 'active';
                    if (status === 'canceled') dbStatus = 'canceled';
                    if (status === 'past_due' || status === 'unpaid') dbStatus = 'past_due';

                    const expiresAt = subscription.current_period_end 
                        ? new Date(subscription.current_period_end * 1000)
                        : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

                    await userRepository.updateSubscription(userId, {
                        subscriptionStatus: dbStatus,
                        subscriptionExpiresAt: expiresAt,
                    });
                }
                break;
            }
        }

        if (logId) {
            await webhookRepository.updateLog(logId, { status: 'processed' });
        }

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Webhook Handling Error:', message);
        if (logId) {
            await webhookRepository.updateLog(logId, { 
                status: 'error', 
                errorMessage: message 
            });
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
