import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { InferSelectModel } from 'drizzle-orm';
import { plans } from '@/db/schema';
import { NextResponse } from 'next/server';

type Plan = InferSelectModel<typeof plans>;

// Keep the instance internal to this module, or export if absolutely necessary elsewhere
export const redis = new Redis({
  url: process.env.REDIS_STORAGE_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.REDIS_STORAGE_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export const heavyRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: '@upstash/ratelimit:heavy',
});

export default redis;

const CACHE_TTL_SECONDS = 86400; // 24 hours

export const redisService = {
  // Heavy Action Rate Limiting
  async checkHeavyRateLimit(userId: string, actionName: string = 'esta operação') {
    try {
      const { success, limit, reset, remaining } = await heavyRatelimit.limit(
        `ratelimit:heavy:${userId}`
      );
      if (!success) {
        return {
          allowed: false,
          response: NextResponse.json(
            { error: `Você atingiu o limite de envios rápidos de ${actionName}. Por favor, aguarde um minuto antes de tentar novamente.` },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
              }
            }
          )
        };
      }
    } catch (redisError) {
      console.warn("[Redis RateLimit] Erro de conexão no limitador. Falhando aberto:", redisError);
    }
    return { allowed: true, response: null };
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
