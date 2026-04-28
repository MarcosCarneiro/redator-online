import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user as userTable, essays } from '@/db/schema';
import { eq, and, isNull, count } from 'drizzle-orm';

const EvaluationSchema = z.object({
  totalScore: z.number().min(0).max(1000),
  competencies: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(200),
    explanation: z.string(),
    tips: z.string()
  })).length(5),
  generalFeedback: z.string()
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Você é um corretor oficial e experiente de redações do ENEM. Sua tarefa é avaliar a redação de forma justa, técnica e encorajadora, seguindo RIGOROSAMENTE o Manual do Corretor do INEP.

REGRAS DE PONTUAÇÃO (OBRIGATÓRIO):
- Cada competência deve receber uma nota que seja MULTIPLO DE 40 (0, 40, 80, 120, 160 ou 200).
- O "totalScore" DEVE SER EXATAMENTE a soma das 5 competências (mínimo 0, máximo 1000).

Instruções de Calibração:
- Competência 1: Admite até dois desvios gramaticais para nota 200.
- Competência 2: Repertório legitimado, pertinente e produtivo garante 200.
- Competência 3: Projeto de texto estratégico e autoria garantem 200.
- Competência 4: Presença de conectivos variados entre parágrafos e frases garante 200.
- Competência 5: Presença dos 5 elementos (Agente, Ação, Meio, Efeito, Detalhamento) garante 200.

Formato de Saída (JSON Estrito):
{
  "totalScore": soma_das_notas,
  "competencies": [
    { "name": "Competência 1: Norma Culta", "score": 200, "explanation": "...", "tips": "..." },
    { "name": "Competência 2: Proposta e Repertório", "score": 200, "explanation": "...", "tips": "..." },
    { "name": "Competência 3: Projeto de Texto", "score": 200, "explanation": "...", "tips": "..." },
    { "name": "Competência 4: Coesão", "score": 200, "explanation": "...", "tips": "..." },
    { "name": "Competência 5: Proposta de Intervenção", "score": 200, "explanation": "...", "tips": "..." }
  ],
  "generalFeedback": "..."
}
`;

export async function POST(req: Request) {
  let rawContent = '';
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    if (!user) {
      const guestEssays = await db
        .select({ value: count() })
        .from(essays)
        .where(
          and(
            eq(essays.userIp, ip),
            isNull(essays.userId)
          )
        );

      const usageCount = guestEssays[0]?.value || 0;
      
      if (usageCount >= 3) {
        return NextResponse.json(
          { error: 'Você atingiu o limite de 3 avaliações gratuitas. Crie uma conta ou faça login para continuar avaliando suas redações e salvar seu histórico!' },
          { status: 403 }
        );
      }
    }

    const { text, theme } = await req.json();

    if (!text || text.length < 150) {
      return NextResponse.json(
        { error: 'A redação é muito curta. Escreva pelo menos 150 caracteres.' },
        { status: 400 }
      );
    }

    if (!theme) {
      return NextResponse.json(
        { error: 'O tema da redação é obrigatório.' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração no servidor.' },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `TEMA: ${theme}\n\nTEXTO: ${text}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    rawContent = response.choices[0].message.content || '';
    const parsedData = JSON.parse(rawContent || '{}');
    
    // Failsafe: Manual recalculation of total score to prevent AI hallucinations
    if (parsedData.competencies && Array.isArray(parsedData.competencies)) {
      const realTotal = parsedData.competencies.reduce((acc: number, comp: any) => acc + (Number(comp.score) || 0), 0);
      parsedData.totalScore = realTotal;
    }

    const validatedData = EvaluationSchema.parse(parsedData);

    try {
      if (user) {
        // Better-Auth manages users automatically, but we might want to ensure custom fields are handled
        // For now, let's just insert the essay linked to the user.id
        await db.insert(essays).values({
          userId: user.id,
          userIp: ip,
          theme,
          content: text,
          totalScore: validatedData.totalScore,
          evaluation: validatedData,
        });
      } else {
        await db.insert(essays).values({
          userIp: ip,
          theme,
          content: text,
          totalScore: validatedData.totalScore,
          evaluation: validatedData,
        });
      }
    } catch (dbError) {
      console.error('Database Persistence Error:', dbError);
    }

    return NextResponse.json(validatedData);
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Zod Validation Error Details:', JSON.stringify(error.issues, null, 2));
      console.error('Raw Content that failed validation:', rawContent);
      return NextResponse.json(
        { error: 'A IA gerou uma resposta inválida. Por favor, tente novamente.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Ocorreu um erro ao processar sua redação.' },
      { status: 500 }
    );
  }
}
