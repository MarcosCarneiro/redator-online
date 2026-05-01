import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { essayRepository } from '@/db/repositories/essay.repository';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EvaluationResults } from '@/components/EvaluationResults';
import { EssayPreview } from '@/components/EssayPreview';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';

import { Evaluation } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EssayDetailPage({ params }: Props) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const { id } = await params;

  if (!session) {
    redirect('/');
  }

  const essayData = await essayRepository.getUserEssayById(id, session.user.id);

  if (!essayData) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '2rem' }}>
        <Link 
          href="/history" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--text-light)', 
            textDecoration: 'none',
            marginBottom: '2rem',
            fontWeight: 600
          }}
        >
          <ChevronLeft size={20} />
          Voltar para o histórico
        </Link>

        <EssayPreview 
          theme={essayData.theme} 
          content={essayData.content} 
        />

        <EvaluationResults 
          evaluation={essayData.evaluation as unknown as Evaluation}
          theme={essayData.theme}
          essay={essayData.content}
        />
      </main>
      <Footer />
    </>
  );
}
