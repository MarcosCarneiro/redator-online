import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Você é um corretor oficial de redações do ENEM (Exame Nacional do Ensino Médio). 
Sua tarefa é avaliar a redação fornecida pelo usuário seguindo rigorosamente os critérios do ENEM.

Avalie as 5 competências:
1. Domínio da norma culta da língua escrita.
2. Compreender a proposta de redação e aplicar conceitos de várias áreas de conhecimento para desenvolver o tema.
3. Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.
4. Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.
5. Elaborar proposta de intervenção para o problema abordado, que respeite os direitos humanos.

Cada competência deve receber uma nota de 0 a 200 (em incrementos de 40: 0, 40, 80, 120, 160, 200).

Você DEVE retornar a resposta EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
{
  "totalScore": number (soma das notas das 5 competências),
  "competencies": [
    {
      "name": "Competência 1",
      "score": number,
      "explanation": "Explicação detalhada da nota baseada nos erros ou acertos encontrados",
      "tips": "Dica prática de como o aluno pode melhorar nesta competência específica"
    },
    ... (repetir para as 5 competências)
  ],
  "generalFeedback": "Um parágrafo com feedback geral sobre o desempenho do aluno e o potencial da redação."
}

Use nomes claros para as competências no JSON. Ex: "Competência 1: Norma Culta".
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
