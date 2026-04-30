import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { essayRepository } from '@/db/repositories/essay.repository';
import { planRepository } from '@/db/repositories/plan.repository';
import { userRepository } from '@/db/repositories/user.repository';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Protect against anonymous abuse (Rate limiting for guests)
    if (!user) {
      const usageCount = await essayRepository.getGuestUsageCount(ip);
      const freePlan = await planRepository.getById('free');
      const FREE_TIER_LIMIT = freePlan?.essayLimit || 3;
      
      if (usageCount >= FREE_TIER_LIMIT) {
        return NextResponse.json(
          { error: 'Você atingiu o limite de transcrições gratuitas. Faça login para continuar.' },
          { status: 403 }
        );
      }
    } else {
      const dbUser = await userRepository.getById(user.id);
      if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      
      if (dbUser.planId !== 'free' && dbUser.subscriptionExpiresAt) {
          const isExpired = new Date() > new Date(dbUser.subscriptionExpiresAt);
          if (isExpired && dbUser.subscriptionStatus !== 'active') {
                return NextResponse.json(
                  { error: 'Sua assinatura expirou. Renove seu plano para continuar acessando os benefícios!' },
                  { status: 403 }
              );
          }
      }

      const isUnlimited = dbUser.planId === 'pro_100'; 
      
      // We fall back to 3 manually since we don't have the free plan fetched here unless we do it
      let limit = dbUser.plan?.essayLimit;
      if (!limit) {
         const freePlan = await planRepository.getById('free');
         limit = freePlan?.essayLimit || 3;
      }
      
      const usedCount = dbUser.transcriptionsUsed || 0;

      if (!isUnlimited && usedCount >= limit) {
          return NextResponse.json(
            { error: `Você atingiu o limite de ${limit} transcrições do seu plano atual. Faça o upgrade para o Plano Intensivo para ter transcrições ilimitadas!` },
            { status: 403 }
          );
      }
    }

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Nenhuma imagem fornecida.' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Erro de configuração no servidor.' }, { status: 500 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em transcrição de manuscritos. Sua tarefa é ler a imagem de uma redação manuscrita e transcrever o texto exatamente como está escrito, sem corrigir erros gramaticais ou fazer comentários. Retorne APENAS o texto transcrito.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Transcreva este manuscrito para mim, por favor.' },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const transcribedText = response.choices[0].message.content;

    if (user) {
        try {
            await userRepository.incrementTranscriptionCount(user.id);
        } catch (dbError) {
            console.error('Failed to increment transcription count:', dbError);
        }
    }

    return NextResponse.json({ text: transcribedText });
  } catch (error: any) {
    console.error('Transcription Error:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao transcrever a imagem.' },
      { status: 500 }
    );
  }
}
