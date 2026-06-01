import { db } from '@/db';
import { essays as essayTable } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';

export const essayRepository = {
    async getUserEssays(userId: string) {
        return db.query.essays.findMany({
            where: eq(essayTable.userId, userId),
            orderBy: [desc(essayTable.createdAt)],
        });
    },

    async getUserEssaysPaginated(userId: string, limit: number, offset: number) {
        return db.query.essays.findMany({
            where: eq(essayTable.userId, userId),
            orderBy: [desc(essayTable.createdAt)],
            limit,
            offset,
        });
    },

    async getUserEssaysCount(userId: string) {
        const result = await db
            .select({ value: count() })
            .from(essayTable)
            .where(eq(essayTable.userId, userId));
        return result[0]?.value ?? 0;
    },

    async getLatestEssaysForChart(userId: string, limit: number = 10) {
        return db.query.essays.findMany({
            where: eq(essayTable.userId, userId),
            orderBy: [desc(essayTable.createdAt)],
            limit,
        });
    },

    async getUserEssayById(id: string, userId: string) {
        return db.query.essays.findFirst({
            where: and(
                eq(essayTable.id, id),
                eq(essayTable.userId, userId)
            ),
        });
    },

    async create(data: {
        userId?: string;
        theme: string;
        content: string;
        totalScore: number;
        c1Score?: number;
        c2Score?: number;
        c3Score?: number;
        c4Score?: number;
        c5Score?: number;
        evaluation: unknown;
    }) {
        return db.insert(essayTable).values(data);
    }
};
