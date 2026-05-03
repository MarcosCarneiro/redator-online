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
      id: 'pro_10',
      name: 'Pro 10',
      price: 1000,
      essayLimit: 10,
      stripePriceId: 'price_123',
      description: 'Test plan'
    };

    it('should get cached plan by ID', async () => {
      vi.mocked(redis.get).mockResolvedValue(mockPlan);
      const plan = await redisService.getCachedPlanById('pro_10');
      expect(plan).toEqual(mockPlan);
      expect(redis.get).toHaveBeenCalledWith('plan:id:pro_10');
    });

    it('should set cached plan by ID with 24h TTL', async () => {
      await redisService.setCachedPlanById('pro_10', mockPlan);
      expect(redis.set).toHaveBeenCalledWith('plan:id:pro_10', mockPlan, { ex: 86400 });
    });
  });
});
