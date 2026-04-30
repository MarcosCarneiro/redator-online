import { db } from '@/db';
import { essays as essayTable } from '@/db/schema';
import { eq, and, isNull, count, desc } from 'drizzle-orm';

export const essayRepository = {
    async getGuestUsageCount(ip: string) {
        const result = await db
            .select({ value: count() })
            .from(essayTable)
            .where(
                and(
                    eq(essayTable.userIp, ip),
                    isNull(essayTable.userId)
                )
            );
        return result[0]?.value || 0;
    },

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
        evaluation: any;
    }) {
        return db.insert(essayTable).values(data);
    }
};
