import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para validação da resposta da IA
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

// Simples Rate Limiting em memória (Para produção real, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || (now - record.lastReset) > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (record.count >= RATE_LIMIT_COUNT) {
    return true;
  }

  record.count++;
  return false;
}

const SYSTEM_PROMPT = `
Você é um corretor oficial e experiente de redações do ENEM. Sua tarefa é avaliar a redação de forma justa, técnica e encorajadora, seguindo RIGOROSAMENTE o Manual do Corretor do INEP.

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
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Limite de correções atingido. Tente novamente em uma hora.' },
        { status: 429 }
      );
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

    const rawContent = response.choices[0].message.content;
    const parsedData = JSON.parse(rawContent || '{}');
    
    // Validação Robusta com Zod
    const validatedData = EvaluationSchema.parse(parsedData);

    return NextResponse.json(validatedData);
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
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
