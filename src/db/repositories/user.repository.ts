import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export const userRepository = {
    async getById(id: string) {
        return db.query.user.findFirst({
            where: eq(userTable.id, id),
            with: {
                plan: true
            }
        });
    },

    async getByCustomerId(customerId: string) {
        return db.query.user.findFirst({
            where: eq(userTable.customerId, customerId),
        });
    },

    async incrementEssayCount(userId: string) {
        return db.update(userTable)
            .set({ 
                essaysUsed: sql`${userTable.essaysUsed} + 1` 
            })
            .where(eq(userTable.id, userId));
    },

    async incrementTranscriptionCount(userId: string) {
        return db.update(userTable)
            .set({ 
                transcriptionsUsed: sql`${userTable.transcriptionsUsed} + 1` 
            })
            .where(eq(userTable.id, userId));
    },

    async updateSubscription(userId: string, data: {
        subscriptionStatus: string;
        subscriptionId?: string;
        customerId?: string;
        planId?: string | null;
        subscriptionExpiresAt: Date;
        resetEssays?: boolean;
    }) {
        const updateData: Record<string, string | number | Date | null> = {
            subscriptionStatus: data.subscriptionStatus,
            subscriptionExpiresAt: data.subscriptionExpiresAt,
        };

        if (data.subscriptionId) updateData.subscriptionId = data.subscriptionId;
        if (data.customerId) updateData.customerId = data.customerId;
        if (data.planId !== undefined) updateData.planId = data.planId;
        if (data.resetEssays) {
            updateData.essaysUsed = 0;
            updateData.transcriptionsUsed = 0;
        }

        return db.update(userTable)
            .set(updateData)
            .where(eq(userTable.id, userId));
    }
};
