import { db } from '@/db';
import { plans as plansTable } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const planRepository = {
    async getPublicPlans() {
        return db.query.plans.findMany({
            where: inArray(plansTable.id, ['pro_10', 'pro_100'])
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
