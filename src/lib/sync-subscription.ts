import { db } from '@/db';
import { user as userTable, plans as plansTable, webhookLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function syncUserSubscription(userId: string) {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) return false;

    try {
        const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/search?external_reference=${userId}&status=authorized`, {
            headers: {
                'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
            }
        });

        if (!mpResponse.ok) {
            console.error('Failed to sync from MP API');
            return false;
        }

        const data = await mpResponse.json();

        if (data.results && data.results.length > 0) {
            // Sort to get the most recent active subscription
            const activeSubscription = data.results.sort((a: any, b: any) => 
                new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime()
            )[0];

            // Log the sync event
            await db.insert(webhookLogs).values({
                provider: 'mercadopago',
                type: 'subscription_preapproval',
                source: 'sync',
                userId: userId,
                resourceId: activeSubscription.id,
                payload: activeSubscription,
                status: 'processed'
            });

            const planId = activeSubscription.preapproval_plan_id;

            const plan = await db.query.plans.findFirst({
                where: eq(plansTable.mercadopagoPlanId, planId)
            });

            const expiresAt = activeSubscription.next_payment_date 
                ? new Date(activeSubscription.next_payment_date) 
                : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

            const currentUser = await db.query.user.findFirst({
                where: eq(userTable.id, userId)
            });

            // Reset essays only if it's a newly synced active subscription
            const shouldResetEssays = currentUser?.subscriptionId !== activeSubscription.id || currentUser?.subscriptionStatus !== 'active';

            await db.update(userTable).set({
                subscriptionStatus: 'active',
                subscriptionId: activeSubscription.id,
                planId: plan?.id || null,
                subscriptionExpiresAt: expiresAt,
                ...(shouldResetEssays ? { essaysUsed: 0 } : {})
            }).where(eq(userTable.id, userId));

            return true;
        }

        return false;
    } catch (error) {
        console.error('Sync function error:', error);
        return false;
    }
}
