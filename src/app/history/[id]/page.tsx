import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { essays } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EvaluationResults } from '@/components/EvaluationResults';
import { EssayPreview } from '@/components/EssayPreview';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EssayDetailPage({ params }: Props) {
  const { userId: clerkId } = await auth();
  const { id } = await params;

  if (!clerkId) {
    redirect('/');
  }

  const essayData = await db.query.essays.findFirst({
    where: eq(essays.id, id),
  });

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
          evaluation={essayData.evaluation as any}
          theme={essayData.theme}
          essay={essayData.content}
        />
      </main>
      <Footer />
    </>
  );
}
