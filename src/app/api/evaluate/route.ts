import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { userRepository } from '@/db/repositories/user.repository';
import { essayRepository } from '@/db/repositories/essay.repository';

const FREE_TIER_LIMIT = 3;

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
Você é um corretor oficial, exigente e detalhista de redações do ENEM. Sua tarefa é avaliar a redação de forma justa, técnica e encorajadora, seguindo RIGOROSAMENTE o Manual do Corretor do INEP.

REGRAS CRÍTICAS DE "NOTA ZERO":
1. FUGA AO TEMA: Se houver FUGA TOTAL AO TEMA, todas as notas devem ser 0.
2. TEXTO INSUFICIENTE: Se o texto tiver menos de 7 linhas, a nota deve ser 0.
3. NÃO ATENDIMENTO AO TIPO TEXTUAL: Se for apenas narração ou poema, a nota é 0.

REGRAS DE PONTUAÇÃO E FEEDBACK (MUITO IMPORTANTE):
- A pontuação deve ser estritamente MULTIPLO DE 40 (0, 40, 80, 120, 160 ou 200) para cada competência.
- O "totalScore" DEVE SER EXATAMENTE a soma das 5 competências.
- SEJA EXTREMAMENTE ESPECÍFICO NAS SUAS EXPLICAÇÕES E DICAS. NÃO SEJA GENÉRICO.
- SEMPRE CITE TRECHOS EXATOS DO TEXTO DO ALUNO (entre aspas) para mostrar exatamente ONDE ele errou.
- Explique claramente O QUE está errado naquele trecho e POR QUE foi penalizado naquela competência específica.
- Na seção "tips" (dicas), mostre um EXEMPLO PRÁTICO de como o aluno poderia reescrever o trecho citado para melhorar a nota.

Instruções de Calibração por Competência:
- Competência 1 (Norma Culta): Aponte desvios gramaticais, problemas de concordância, regência, pontuação ou ortografia CITANDO a palavra ou frase exata do texto. Dê a versão corrigida na dica.
- Competência 2 (Repertório e Tema): Avalie se o repertório sociocultural foi legitimado, pertinente e produtivo. Se foi apenas "jogado" (não produtivo), cite o trecho e explique o porquê. Diga como ele poderia conectar melhor a área do conhecimento ao argumento.
- Competência 3 (Projeto de Texto e Argumentação): Aponte lacunas argumentativas. Cite a frase exata onde faltou desenvolvimento, onde houve contradição ou onde um argumento ficou solto. Sugira como aprofundar aquele argumento específico.
- Competência 4 (Coesão): Aponte repetições de palavras ou uso inadequado/ausência de conectivos. Cite os períodos ou parágrafos exatos que ficaram sem ligação e sugira conectivos específicos (ex: "Desse modo", "Por conseguinte") que caberiam ali.
- Competência 5 (Proposta de Intervenção): Verifique os 5 elementos (Agente, Ação, Meio/Modo, Efeito, Detalhamento). Diga explicitamente qual(is) desses elementos o aluno esqueceu de colocar. Dê um exemplo prático de como ele poderia inserir o elemento faltante na proposta dele.

Formato de Saída (JSON Estrito):
{
  "totalScore": soma_das_notas,
  "competencies": [
    { "name": "Competência 1: Norma Culta", "score": 200, "explanation": "[Sua explicação detalhada citando os trechos exatos dos erros encontrados no texto]", "tips": "[Exemplos de como corrigir e reescrever os trechos citados]" },
    { "name": "Competência 2: Proposta e Repertório", "score": 200, "explanation": "...", "tips": "..." },
    { "name": "Competência 3: Projeto de Texto", "score": 200, "explanation": "...", "tips": "..." },
    { "name": "Competência 4: Coesão", "score": 200, "explanation": "...", "tips": "..." },
    { "name": "Competência 5: Proposta de Intervenção", "score": 200, "explanation": "...", "tips": "..." }
  ],
  "generalFeedback": "[Um resumo encorajador destacando o ponto forte da redação e o principal ponto fraco que precisa de atenção urgente para a próxima redação]"
}
`;

export async function POST(req: Request) {
  let rawContent = '';
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;
    
    // Security: Better IP detection (less spoofable than x-forwarded-for alone)
    const ip = req.headers.get('x-real-ip') || 
               req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               '127.0.0.1';
    
    let dbUser: any = null;

    if (!user) {
      const usageCount = await essayRepository.getGuestUsageCount(ip);
      
      if (usageCount >= FREE_TIER_LIMIT) {
        return NextResponse.json(
          { error: `Você atingiu o limite de ${FREE_TIER_LIMIT} avaliações gratuitas. Crie uma conta ou faça login para continuar avaliando suas redações e salvar seu histórico!` },
          { status: 403 }
        );
      }
    } else {
        dbUser = await userRepository.getById(user.id);

        if (!dbUser) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Strict Subscription Check
        const currentPlan = dbUser.plan || { id: 'free', name: 'Grátis', essayLimit: FREE_TIER_LIMIT };
        const usedCount = dbUser.essaysUsed || 0;

        // Check if subscription is expired (and not in the process of paying/past_due)
        if (dbUser.planId !== 'free' && dbUser.subscriptionExpiresAt) {
            const isExpired = new Date() > new Date(dbUser.subscriptionExpiresAt);
            if (isExpired && dbUser.subscriptionStatus !== 'active') {
                 return NextResponse.json(
                    { error: 'Sua assinatura expirou. Renove seu plano para continuar acessando os benefícios!' },
                    { status: 403 }
                );
            }
        }

        if (usedCount >= currentPlan.essayLimit) {
            return NextResponse.json(
                { error: `Você atingiu o limite de ${currentPlan.essayLimit} redações do seu plano ${currentPlan.name}. Faça um upgrade para continuar!` },
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
    
    if (parsedData.competencies && Array.isArray(parsedData.competencies)) {
      const realTotal = parsedData.competencies.reduce((acc: number, comp: any) => acc + (Number(comp.score) || 0), 0);
      parsedData.totalScore = realTotal;
    }

    const validatedData = EvaluationSchema.parse(parsedData);

    try {
      if (user) {
        // Atomic increment in DB
        await userRepository.incrementEssayCount(user.id);

        await essayRepository.create({
          userId: user.id,
          userIp: ip,
          theme,
          content: text,
          totalScore: validatedData.totalScore,
          evaluation: validatedData,
        });
      } else {
        await essayRepository.create({
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
