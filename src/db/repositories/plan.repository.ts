import { db } from '@/db';
import { plans as plansTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const planRepository = {
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
