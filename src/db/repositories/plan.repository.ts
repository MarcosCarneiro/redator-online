import { db } from '@/db';
import { plans as plansTable } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { PUBLIC_PLANS } from '@/lib/constants';

export const planRepository = {
    async getPublicPlans() {
        return db.query.plans.findMany({
            where: inArray(plansTable.id, [...PUBLIC_PLANS])
        });
    },

    async getById(id: string) {
        return db.query.plans.findFirst({
            where: eq(plansTable.id, id)
        });
    },

    async getByStripePriceId(priceId: string) {
        return db.query.plans.findFirst({
            where: eq(plansTable.stripePriceId, priceId)
        });
    }
};
