import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuotaService } from './quota';
import { userRepository } from '@/db/repositories/user.repository';
import { planRepository } from '@/db/repositories/plan.repository';
import { redisService } from '@/lib/redis';

vi.mock('@/db/repositories/user.repository');
vi.mock('@/db/repositories/plan.repository');
vi.mock('@/lib/redis', () => ({
  redisService: {
    checkHeavyRateLimit: vi.fn(),
  },
}));

describe('QuotaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redisService.checkHeavyRateLimit).mockResolvedValue({ allowed: true, response: null } as unknown as never);
    vi.mocked(planRepository.getById).mockResolvedValue({ id: 'free', name: 'Grátis', essayLimit: 3 } as unknown as never);
  });

  it('should return 404 if user is not found', async () => {
    vi.mocked(userRepository.getById).mockResolvedValue(null);

    const result = await QuotaService.checkUserQuota('user_unknown', 'essay');

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(404);
    expect(result.error).toBe('Usuário não encontrado');
  });

  it('should return 429 if rate limit is exceeded', async () => {
    const mockUser = { id: 'user_123' };
    vi.mocked(userRepository.getById).mockResolvedValue(mockUser as unknown as never);
    vi.mocked(redisService.checkHeavyRateLimit).mockResolvedValue({ allowed: false } as unknown as never);

    const result = await QuotaService.checkUserQuota('user_123', 'essay');

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(429);
    expect(result.error).toContain('Você atingiu o limite de envios rápidos');
  });

  it('should return 403 if subscription is expired', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() - 1); // Yesterday

    const mockUser = {
      id: 'user_123',
      planId: 'pro_10',
      subscriptionExpiresAt: futureDate,
      subscriptionStatus: 'canceled',
    };
    vi.mocked(userRepository.getById).mockResolvedValue(mockUser as unknown as never);

    const result = await QuotaService.checkUserQuota('user_123', 'essay');

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toContain('Sua assinatura expirou');
  });

  it('should allow if subscription is expired but status is active (e.g. grace period/invoicing)', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() - 1); // Yesterday

    const mockUser = {
      id: 'user_123',
      planId: 'pro_10',
      subscriptionExpiresAt: futureDate,
      subscriptionStatus: 'active',
      essaysUsed: 2,
      plan: { id: 'pro_10', name: 'Pro 10', essayLimit: 10 },
    };
    vi.mocked(userRepository.getById).mockResolvedValue(mockUser as unknown as never);

    const result = await QuotaService.checkUserQuota('user_123', 'essay');

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.used).toBe(2);
  });

  it('should return 403 if essay limit is reached', async () => {
    const mockUser = {
      id: 'user_123',
      planId: 'free',
      essaysUsed: 3,
    };
    vi.mocked(userRepository.getById).mockResolvedValue(mockUser as unknown as never);

    const result = await QuotaService.checkUserQuota('user_123', 'essay');

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toContain('Você atingiu o limite de 3 redações');
  });

  it('should return 403 if transcription limit is reached', async () => {
    const mockUser = {
      id: 'user_123',
      planId: 'free',
      transcriptionsUsed: 3,
    };
    vi.mocked(userRepository.getById).mockResolvedValue(mockUser as unknown as never);

    const result = await QuotaService.checkUserQuota('user_123', 'transcription');

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toContain('Você atingiu o limite de 3 transcrições');
  });

  it('should allow if within limits', async () => {
    const mockUser = {
      id: 'user_123',
      planId: 'pro_10',
      essaysUsed: 5,
      transcriptionsUsed: 2,
      plan: { id: 'pro_10', name: 'Pro 10', essayLimit: 10 },
    };
    vi.mocked(userRepository.getById).mockResolvedValue(mockUser as unknown as never);

    const essayResult = await QuotaService.checkUserQuota('user_123', 'essay');
    expect(essayResult.allowed).toBe(true);
    expect(essayResult.limit).toBe(10);
    expect(essayResult.used).toBe(5);

    const transcriptionResult = await QuotaService.checkUserQuota('user_123', 'transcription');
    expect(transcriptionResult.allowed).toBe(true);
    expect(transcriptionResult.limit).toBe(10);
    expect(transcriptionResult.used).toBe(2);
  });
});
