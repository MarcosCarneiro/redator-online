import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { essayRepository } from '@/db/repositories/essay.repository';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FileText, Calendar, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function HistoryPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <h1>Acesso negado</h1>
        <p>Faça login para visualizar seu histórico.</p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem' }}>
          Voltar para o Início
        </Link>
      </div>
    );
  }

  // Busca as redações através do repositório
  const userEssays = await essayRepository.getUserEssays(session.user.id);

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '4rem 2rem', minHeight: '80vh' }}>
        <header style={{ marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            Meu Histórico
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            Acompanhe sua evolução e reveja suas avaliações anteriores.
          </p>
        </header>

        {userEssays.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#fff', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
            <FileText size={64} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
            <h2 style={{ color: 'var(--text-dark)' }}>Nenhuma redação encontrada</h2>
            <p style={{ color: 'var(--text-light)' }}>Você ainda não realizou nenhuma avaliação oficial.</p>
            <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem' }}>
              Começar minha primeira redação
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {userEssays.map((essay) => (
              <Link 
                key={essay.id} 
                href={`/history/${essay.id}`}
                className="history-card"
                style={{ textDecoration: 'none' }}
              >
                <div className="history-card-content">
                  <div className="history-icon-box">
                    <Trophy size={24} color={essay.totalScore && essay.totalScore >= 900 ? '#f59e0b' : '#3b82f6'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{essay.theme}</h3>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {essay.createdAt?.toLocaleDateString('pt-BR')}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        Nota: {essay.totalScore} pts
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} color="#cbd5e1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
