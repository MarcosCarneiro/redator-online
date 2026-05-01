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

  describe('getGuestUsage', () => {
    it('should return the usage count from redis', async () => {
      vi.mocked(redis.get).mockResolvedValue(5);
      const usage = await redisService.getGuestUsage('127.0.0.1');
      expect(usage).toBe(5);
      expect(redis.get).toHaveBeenCalledWith('guest:usage:127.0.0.1');
    });

    it('should return 0 if redis returns null', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      const usage = await redisService.getGuestUsage('127.0.0.1');
      expect(usage).toBe(0);
    });
  });

  describe('incrementGuestUsage', () => {
    it('should increment the usage in redis', async () => {
      vi.mocked(redis.incr).mockResolvedValue(1);
      const newVal = await redisService.incrementGuestUsage('127.0.0.1');
      expect(newVal).toBe(1);
      expect(redis.incr).toHaveBeenCalledWith('guest:usage:127.0.0.1');
    });
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
