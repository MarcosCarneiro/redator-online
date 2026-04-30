import { userRepository } from '@/db/repositories/user.repository';
import { planRepository } from '@/db/repositories/plan.repository';
import { webhookRepository } from '@/db/repositories/webhook.repository';
import { stripe } from '@/lib/stripe';

export async function syncUserSubscription(userId: string) {
    if (!process.env.STRIPE_SECRET_KEY) return false;

    try {
        const currentUser = await userRepository.getById(userId);

        if (!currentUser || !currentUser.customerId) {
            return false;
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: currentUser.customerId,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length > 0) {
            const activeSubscription = subscriptions.data[0];

            // Log the sync event
            await webhookRepository.createLog({
                provider: 'stripe',
                type: 'customer.subscription.sync',
                source: 'sync',
                userId: userId,
                resourceId: activeSubscription.id,
                payload: activeSubscription as any,
                status: 'processed'
            });

            const priceId = activeSubscription.items.data[0]?.price.id;
            const plan = await planRepository.getByStripePriceId(priceId);

            const expiresAt = (activeSubscription as any).current_period_end 
                ? new Date((activeSubscription as any).current_period_end * 1000)
                : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

            // Reset essays only if it's a newly synced active subscription or was not active
            const isNewSub = currentUser.subscriptionId !== activeSubscription.id;
            const wasNotActive = currentUser.subscriptionStatus !== 'active';

            await userRepository.updateSubscription(userId, {
                subscriptionStatus: 'active',
                subscriptionId: activeSubscription.id,
                planId: plan?.id || null,
                subscriptionExpiresAt: expiresAt,
                resetEssays: isNewSub || wasNotActive
            });

            return true;
        } else {
             if (currentUser.subscriptionStatus === 'active') {
                 await userRepository.updateSubscription(userId, {
                     subscriptionStatus: 'canceled',
                     subscriptionExpiresAt: new Date(),
                 });
             }
        }

        return false;
    } catch (error) {
        console.error('Sync function error:', error);
        return false;
    }
}
