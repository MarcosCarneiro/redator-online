import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { planRepository } from '@/db/repositories/plan.repository';
import { userRepository } from '@/db/repositories/user.repository';
import { QuotaService } from '@/lib/quota';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    const freePlan = await planRepository.getById('free');
    const FREE_TIER_LIMIT = freePlan?.essayLimit || 3;

    // Protect against anonymous abuse
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Crie sua conta gratuitamente para utilizar a transcrição de redações!',
          freeLimit: FREE_TIER_LIMIT
        },
        { status: 401 }
      );
    }

    // Centralized Quota and Limit Check using QuotaService
    const quotaCheck = await QuotaService.checkUserQuota(user.id, 'transcription');
    if (!quotaCheck.allowed) {
        return NextResponse.json(
            { error: quotaCheck.error },
            { status: quotaCheck.status }
        );
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

    try {
        await userRepository.incrementTranscriptionCount(user.id);
    } catch (dbError) {
        console.error('Failed to increment transcription count:', dbError);
    }

    return NextResponse.json({ text: transcribedText });
  } catch (error: unknown) {
    console.error('Transcription Error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao transcrever a imagem.' },
      { status: 500 }
    );
  }
}
