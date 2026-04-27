import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Você é um corretor oficial e experiente de redações do ENEM. Sua tarefa é avaliar a redação de forma justa, técnica e encorajadora, seguindo RIGOROSAMENTE o Manual do Corretor do INEP.

Instruções de Calibração (Para evitar ser excessivamente punitivo):
- Competência 1: A nota 200 admite até dois desvios gramaticais ou uma falha de estrutura sintática, desde que sejam excepcionais e não recorrentes. Não retire pontos por erros isolados que não prejudicam a fluidez.
- Competência 2: Se o aluno apresentar um repertório legitimado (citando um autor, fato histórico, livro, etc.), pertinente ao tema e com uso produtivo, ele deve receber 200.
- Competência 3: Avalie o projeto de texto. Se a argumentação é clara, organizada e defende um ponto de vista com autoria, a nota deve ser alta.
- Competência 4: Busque pela presença de conectivos variados entre parágrafos e entre frases. Se o texto flui bem e usa operadores argumentativos, dê 200.
- Competência 5: Seja objetivo. A proposta de intervenção deve ter: Agente, Ação, Meio/Modo, Efeito e Detalhamento. Se os 5 elementos estão presentes e são claros, a nota é 200, independente da viabilidade política da proposta.

Notas: 0, 40, 80, 120, 160, 200 para cada competência.

Você DEVE retornar a resposta EXCLUSIVAMENTE em formato JSON:
{
  "totalScore": number,
  "competencies": [
    {
      "name": "Competência 1: Norma Culta",
      "score": number,
      "explanation": "Explicação técnica citando pontos do texto",
      "tips": "Como chegar ao próximo nível ou manter o 200"
    },
    ...
  ],
  "generalFeedback": "Feedback encorajador e resumo dos pontos fortes e a melhorar."
}
Responda sempre em Português.
`;

export async function POST(req: Request) {
  try {
    const { text, theme } = await req.json();

    if (!text || text.length < 100) {
      return NextResponse.json(
        { error: 'A redação é muito curta para ser avaliada.' },
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
        { error: 'Configuração da API não encontrada.' },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', 
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Tema da Redação: ${theme}\n\nTexto da Redação:\n${text}` },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a correção com a IA.' },
      { status: 500 }
    );
  }
}
