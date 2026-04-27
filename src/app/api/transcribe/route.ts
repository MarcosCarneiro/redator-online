import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
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
                url: image, // A imagem deve vir como data:image/jpeg;base64,...
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const transcribedText = response.choices[0].message.content;

    return NextResponse.json({ text: transcribedText });
  } catch (error: any) {
    console.error('Transcription Error:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao transcrever a imagem. Certifique-se de que a imagem está clara.' },
      { status: 500 }
    );
  }
}
