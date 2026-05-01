import { redisService } from '@/lib/redis';
import { essayRepository } from '@/db/repositories/essay.repository';

/**
 * Robustly retrieves the current usage count for a guest IP.
 * Attempts to fetch from Redis first for performance, falling back to the database.
 */
export async function getGuestUsageRobust(ip: string): Promise<number> {
  try {
    return await redisService.getGuestUsage(ip);
  } catch (error) {
    console.warn(`[Usage] Redis error for IP ${ip}, falling back to DB:`, error);
    return await essayRepository.getGuestUsageCount(ip);
  }
}
