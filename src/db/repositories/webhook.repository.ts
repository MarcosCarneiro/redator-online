import { db } from '@/db';
import { webhookLogs as webhookTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const webhookRepository = {
    async createLog(data: {
        provider: string;
        type: string;
        source: string;
        userId?: string | null;
        resourceId?: string | null;
        payload: unknown;
        status: string;
    }) {
        const [inserted] = await db.insert(webhookTable)
            .values(data)
            .returning({ id: webhookTable.id });
        return inserted.id;
    },

    async updateLog(id: string, data: {
        userId?: string | null;
        status?: string;
        errorMessage?: string | null;
        payload?: unknown;
    }) {
        return db.update(webhookTable)
            .set(data)
            .where(eq(webhookTable.id, id));
    }
};
