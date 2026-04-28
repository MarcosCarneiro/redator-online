import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user as userTable, plans as plansTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Actively query Mercado Pago for this user's subscriptions
        const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/search?external_reference=${userId}&status=authorized`, {
            headers: {
                'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
            }
        });

        if (!mpResponse.ok) {
            const errorData = await mpResponse.json();
            console.error('Failed to sync subscription from Mercado Pago:', errorData);
            return NextResponse.json({ error: 'Failed to sync with payment provider' }, { status: 500 });
        }

        const data = await mpResponse.json();
        
        // If we found an active subscription
        if (data.results && data.results.length > 0) {
            // Sort by last_modified to get the most recent one if there are multiple
            const activeSubscription = data.results.sort((a: any, b: any) => 
                new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime()
            )[0];

            const planId = activeSubscription.preapproval_plan_id;

            const plan = await db.query.plans.findFirst({
                where: eq(plansTable.mercadopagoPlanId, planId)
            });

            // Calculate expiration (e.g., 30 days from the last modification or creation)
            // MP also provides next_payment_date if available, but +30 days is a safe fallback
            const expiresAt = activeSubscription.next_payment_date 
                ? new Date(activeSubscription.next_payment_date) 
                : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

            // Fetch current user to avoid resetting essays if already on the same active sub
            const currentUser = await db.query.user.findFirst({
                where: eq(userTable.id, userId)
            });

            // Only reset essays if it's a new subscription or status changed from non-active
            const shouldResetEssays = currentUser?.subscriptionId !== activeSubscription.id || currentUser?.subscriptionStatus !== 'active';

            await db.update(userTable).set({
                subscriptionStatus: 'active',
                subscriptionId: activeSubscription.id,
                planId: plan?.id || null,
                subscriptionExpiresAt: expiresAt,
                ...(shouldResetEssays ? { essaysUsed: 0 } : {})
            }).where(eq(userTable.id, userId));

            return NextResponse.json({ synced: true, status: 'active', planId: plan?.id });
        } else {
            // No active subscription found, optionally mark as canceled if they had one
            return NextResponse.json({ synced: true, status: 'none' });
        }

    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
