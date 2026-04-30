import { db } from '@/db';
import { essays as essayTable } from '@/db/schema';
import { eq, and, isNull, count } from 'drizzle-orm';

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
