import { db } from '@/db';
import { plans as plansTable } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { PUBLIC_PLANS } from '@/lib/constants';
import { redisService } from '@/lib/redis';

export const planRepository = {
    async getPublicPlans() {
        // Try Cache
        const cached = await redisService.getCachedPublicPlans();
        if (cached) return cached;

        // DB Query
        const plans = await db.query.plans.findMany({
            where: inArray(plansTable.id, [...PUBLIC_PLANS])
        });

        // Set Cache
        if (plans.length > 0) {
            await redisService.setCachedPublicPlans(plans);
        }

        return plans;
    },

    async getById(id: string) {
        // Try Cache
        const cached = await redisService.getCachedPlanById(id);
        if (cached) return cached;

        // DB Query
        const plan = await db.query.plans.findFirst({
            where: eq(plansTable.id, id)
        });

        // Set Cache
        if (plan) {
            await redisService.setCachedPlanById(id, plan);
        }

        return plan;
    },

    async getByStripePriceId(priceId: string) {
        // Try Cache
        const cached = await redisService.getCachedPlanByPriceId(priceId);
        if (cached) return cached;

        // DB Query
        const plan = await db.query.plans.findFirst({
            where: eq(plansTable.stripePriceId, priceId)
        });

        // Set Cache
        if (plan) {
            await redisService.setCachedPlanByPriceId(priceId, plan);
        }

        return plan;
    }
};
