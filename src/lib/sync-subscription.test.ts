import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncUserSubscription } from './sync-subscription';
import { userRepository } from '@/db/repositories/user.repository';
import { stripe } from '@/lib/stripe';
import { planRepository } from '@/db/repositories/plan.repository';

vi.mock('@/db/repositories/user.repository');
vi.mock('@/db/repositories/plan.repository');
vi.mock('@/db/repositories/webhook.repository');
vi.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: {
      list: vi.fn(),
    },
  },
}));

describe('syncUserSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  });

  it('should return false if no user is found', async () => {
    vi.mocked(userRepository.getById).mockResolvedValue(null as any);
    const result = await syncUserSubscription('user_123');
    expect(result).toBe(false);
  });

  it('should return false if user has no customerId', async () => {
    vi.mocked(userRepository.getById).mockResolvedValue({ id: 'user_123', customerId: null } as unknown as never);
    const result = await syncUserSubscription('user_123');
    expect(result).toBe(false);
  });

  it('should sync active subscription and return true', async () => {
    const mockUser = { id: 'user_123', customerId: 'cus_123', subscriptionStatus: 'none' };
    const mockSubscription = {
      id: 'sub_123',
      current_period_end: Math.floor(Date.now() / 1000) + 10000,
      items: { data: [{ price: { id: 'price_123' } }] },
    };
    const mockPlan = { id: 'pro_10' };

    vi.mocked(userRepository.getById).mockResolvedValue(mockUser as unknown as never);
    vi.mocked(stripe.subscriptions.list).mockResolvedValue({ data: [mockSubscription] } as unknown as never);
    vi.mocked(planRepository.getByStripePriceId).mockResolvedValue(mockPlan as unknown as never);

    const result = await syncUserSubscription('user_123');

    expect(result).toBe(true);
    expect(userRepository.updateSubscription).toHaveBeenCalledWith('user_123', expect.objectContaining({
      subscriptionStatus: 'active',
      subscriptionId: 'sub_123',
      planId: 'pro_10',
    }));
  });

  it('should handle no active subscriptions by canceling local status', async () => {
    const mockUser = { id: 'user_123', customerId: 'cus_123', subscriptionStatus: 'active' };

    vi.mocked(userRepository.getById).mockResolvedValue(mockUser as unknown as never);
    vi.mocked(stripe.subscriptions.list).mockResolvedValue({ data: [] } as unknown as never);

    const result = await syncUserSubscription('user_123');

    expect(result).toBe(false);
    expect(userRepository.updateSubscription).toHaveBeenCalledWith('user_123', expect.objectContaining({
      subscriptionStatus: 'canceled',
    }));
  });
});
