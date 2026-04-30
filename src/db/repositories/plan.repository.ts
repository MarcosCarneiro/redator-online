import { db } from '@/db';
import { plans as plansTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const planRepository = {
    async getAll() {
        return db.query.plans.findMany({
            where: (plans, { ne }) => ne(plans.id, 'free')
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
