import { db } from '@/db';
import { user as userTable, plans as plansTable, webhookLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';

export async function syncUserSubscription(userId: string) {
    if (!process.env.STRIPE_SECRET_KEY) return false;

    try {
        const currentUser = await db.query.user.findFirst({
            where: eq(userTable.id, userId)
        });

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
            await db.insert(webhookLogs).values({
                provider: 'stripe',
                type: 'customer.subscription.sync',
                source: 'sync',
                userId: userId,
                resourceId: activeSubscription.id,
                payload: activeSubscription as any,
                status: 'processed'
            });

            const priceId = activeSubscription.items.data[0]?.price.id;

            const plan = await db.query.plans.findFirst({
                where: eq(plansTable.stripePriceId, priceId)
            });

            const expiresAt = (activeSubscription as any).current_period_end 
                ? new Date((activeSubscription as any).current_period_end * 1000)
                : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

            // Reset essays only if it's a newly synced active subscription
            const shouldResetEssays = currentUser.subscriptionId !== activeSubscription.id || currentUser.subscriptionStatus !== 'active';

            await db.update(userTable).set({
                subscriptionStatus: 'active',
                subscriptionId: activeSubscription.id,
                planId: plan?.id || null,
                subscriptionExpiresAt: expiresAt,
                ...(shouldResetEssays ? { essaysUsed: 0 } : {})
            }).where(eq(userTable.id, userId));

            return true;
        } else {
             // Maybe update to inactive if there are no active subs
             if (currentUser.subscriptionStatus === 'active') {
                 await db.update(userTable).set({
                     subscriptionStatus: 'canceled',
                 }).where(eq(userTable.id, userId));
             }
        }

        return false;
    } catch (error) {
        console.error('Sync function error:', error);
        return false;
    }
}
