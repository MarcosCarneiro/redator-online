import { Redis } from '@upstash/redis';
import { InferSelectModel } from 'drizzle-orm';
import { plans } from '@/db/schema';

type Plan = InferSelectModel<typeof plans>;

// Keep the instance internal to this module, or export if absolutely necessary elsewhere
export const redis = new Redis({
  url: process.env.REDIS_STORAGE_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.REDIS_STORAGE_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export default redis;

const CACHE_TTL_SECONDS = 86400; // 24 hours

export const redisService = {
  // Guest Usage Tracking
  async getGuestUsage(ip: string): Promise<number> {
    try {
      return (await redis.get<number>(`guest:usage:${ip}`)) || 0;
    } catch (error) {
      console.warn(`[Redis] Error getting guest usage for ${ip}:`, error);
      throw error;
    }
  },

  async incrementGuestUsage(ip: string): Promise<number> {
    try {
      return await redis.incr(`guest:usage:${ip}`);
    } catch (error) {
      console.warn(`[Redis] Error incrementing guest usage for ${ip}:`, error);
      throw error; // Or handle silently depending on caller
    }
  },

  // Plan Caching
  async getCachedPublicPlans(): Promise<Plan[] | null> {
    try {
      return await redis.get<Plan[]>('plans:public');
    } catch (error) {
      console.warn('[Redis] Error getting cached public plans:', error);
      return null;
    }
  },

  async setCachedPublicPlans(plansToCache: Plan[]): Promise<void> {
    try {
      await redis.set('plans:public', plansToCache, { ex: CACHE_TTL_SECONDS });
    } catch (error) {
      console.warn('[Redis] Error setting cached public plans:', error);
    }
  },

  async getCachedPlanById(id: string): Promise<Plan | null> {
    try {
      return await redis.get<Plan>(`plan:id:${id}`);
    } catch (error) {
      console.warn(`[Redis] Error getting cached plan by ID ${id}:`, error);
      return null;
    }
  },

  async setCachedPlanById(id: string, plan: Plan): Promise<void> {
    try {
      await redis.set(`plan:id:${id}`, plan, { ex: CACHE_TTL_SECONDS });
    } catch (error) {
      console.warn(`[Redis] Error setting cached plan by ID ${id}:`, error);
    }
  },

  async getCachedPlanByPriceId(priceId: string): Promise<Plan | null> {
    try {
      return await redis.get<Plan>(`plan:priceId:${priceId}`);
    } catch (error) {
      console.warn(`[Redis] Error getting cached plan by price ID ${priceId}:`, error);
      return null;
    }
  },

  async setCachedPlanByPriceId(priceId: string, plan: Plan): Promise<void> {
    try {
      await redis.set(`plan:priceId:${priceId}`, plan, { ex: CACHE_TTL_SECONDS });
    } catch (error) {
      console.warn(`[Redis] Error setting cached plan by price ID ${priceId}:`, error);
    }
  }
};
