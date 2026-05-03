import { db } from '@/db';
import { essays as essayTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const essayRepository = {
    async getUserEssays(userId: string) {
        return db.query.essays.findMany({
            where: eq(essayTable.userId, userId),
            orderBy: [desc(essayTable.createdAt)],
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
        userIp: string;
        theme: string;
        content: string;
        totalScore: number;
        evaluation: unknown;
    }) {
        return db.insert(essayTable).values(data);
    }
};
