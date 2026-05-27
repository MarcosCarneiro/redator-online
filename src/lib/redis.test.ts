import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redisService, redis } from './redis';

vi.mock('@upstash/redis', () => {
  return {
    Redis: class {
      get = vi.fn();
      set = vi.fn();
      incr = vi.fn();
    },
  };
});

describe('redisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Plan Caching', () => {
    const mockPlan = {
      id: 'pro_2',
      name: 'Plano Mensal - 2',
      price: 490,
      essayLimit: 2,
      stripePriceId: 'price_123',
      description: 'Test plan'
    };

    it('should get cached plan by ID', async () => {
      vi.mocked(redis.get).mockResolvedValue(mockPlan);
      const plan = await redisService.getCachedPlanById('pro_2');
      expect(plan).toEqual(mockPlan);
      expect(redis.get).toHaveBeenCalledWith('plan:id:pro_2');
    });

    it('should set cached plan by ID with 24h TTL', async () => {
      await redisService.setCachedPlanById('pro_2', mockPlan);
      expect(redis.set).toHaveBeenCalledWith('plan:id:pro_2', mockPlan, { ex: 86400 });
    });
  });
});
