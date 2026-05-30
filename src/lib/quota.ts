import { userRepository } from '@/db/repositories/user.repository';
import { planRepository } from '@/db/repositories/plan.repository';
import { redisService } from '@/lib/redis';

export type QuotaActionType = 'essay' | 'transcription';

export interface QuotaCheckResult {
  allowed: boolean;
  status?: number;
  error?: string;
  limit?: number;
  used?: number;
}

export class QuotaService {
  /**
   * Checks the user's active quota, subscription expiration, and rate limits.
   * Centralizes all plan capability and threshold logic.
   * 
   * @param userId Unique ID of the authenticated user
   * @param actionType The operation to check ('essay' or 'transcription')
   */
  static async checkUserQuota(userId: string, actionType: QuotaActionType): Promise<QuotaCheckResult> {
    const dbUser = await userRepository.getById(userId);
    if (!dbUser) {
      return {
        allowed: false,
        status: 404,
        error: 'Usuário não encontrado'
      };
    }

    // 1. Rate Limiting strictly by userId (Fail-Open)
    const actionName = actionType === 'essay' ? 'redação' : 'transcrição';
    const rateLimit = await redisService.checkHeavyRateLimit(userId, actionName);
    if (!rateLimit.allowed) {
      return {
        allowed: false,
        status: 429,
        error: `Você atingiu o limite de envios rápidos de ${actionName}. Por favor, aguarde um minuto antes de tentar novamente.`
      };
    }

    // 2. Subscription Expiration Validation (if plan is not free)
    if (dbUser.planId !== 'free' && dbUser.subscriptionExpiresAt) {
      const isExpired = new Date() > new Date(dbUser.subscriptionExpiresAt);
      if (isExpired && dbUser.subscriptionStatus !== 'active') {
        return {
          allowed: false,
          status: 403,
          error: 'Sua assinatura expirou. Renove seu plano para continuar acessando os benefícios!'
        };
      }
    }

    // 3. Usage Limits Validation
    const freePlan = await planRepository.getById('free');
    const FREE_TIER_LIMIT = freePlan?.essayLimit || 3;

    if (actionType === 'essay') {
      const currentPlan = dbUser.plan || { id: 'free', name: 'Grátis', essayLimit: FREE_TIER_LIMIT };
      const used = dbUser.essaysUsed || 0;
      const limit = currentPlan.essayLimit;

      if (used >= limit) {
        return {
          allowed: false,
          status: 403,
          error: `Você atingiu o limite de ${limit} redações do seu plano ${currentPlan.name}. Faça um upgrade para continuar!`,
          limit,
          used
        };
      }

      return { allowed: true, limit, used };
    } else {
      // Transcription uses the same base essayLimit or a default free limit
      const limit = dbUser.plan?.essayLimit || FREE_TIER_LIMIT;
      const used = dbUser.transcriptionsUsed || 0;

      if (used >= limit) {
        return {
          allowed: false,
          status: 403,
          error: `Você atingiu o limite de ${limit} transcrições do seu plano atual. Faça o upgrade para um plano maior para ter mais transcrições!`,
          limit,
          used
        };
      }

      return { allowed: true, limit, used };
    }
  }
}
