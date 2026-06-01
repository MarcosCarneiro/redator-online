import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { essayRepository } from '@/db/repositories/essay.repository';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EvolutionCharts } from '@/components/EvolutionCharts';
import { FileText, Calendar, ChevronRight, Trophy, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function HistoryPage(props: {
  searchParams: Promise<{ page?: string }>
}) {
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

  // Parse page parameter
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  // Retrieve total count of essays
  const totalEssays = await essayRepository.getUserEssaysCount(session.user.id);
  const totalPages = Math.ceil(totalEssays / limit) || 1;

  // Fetch paginated essays for the list
  const paginatedEssays = await essayRepository.getUserEssaysPaginated(session.user.id, limit, offset);

  // Fetch latest 10 essays for evolution chart
  const latestEssays = await essayRepository.getLatestEssaysForChart(session.user.id, 10);
  // Reverse to make them chronological (left to right)
  const chartEssays = [...latestEssays].reverse();

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '4rem 2rem', minHeight: '80vh' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            Meu Histórico
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            Acompanhe sua evolução e reveja suas avaliações anteriores.
          </p>
        </header>

        {totalEssays === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#fff', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
            <FileText size={64} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
            <h2 style={{ color: 'var(--text-dark)' }}>Nenhuma redação encontrada</h2>
            <p style={{ color: 'var(--text-light)' }}>Você ainda não realizou nenhuma avaliação oficial.</p>
            <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem' }}>
              Começar minha primeira redação
            </Link>
          </div>
        ) : (
          <>
            {/* Evolution Charts */}
            <EvolutionCharts essays={chartEssays} />

            {/* List Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                Todas as Redações ({totalEssays})
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                Exibindo {offset + 1}-{Math.min(offset + limit, totalEssays)} de {totalEssays}
              </span>
            </div>

            {/* Essays List */}
            <div style={{ display: 'grid', gap: '1.2rem' }}>
              {paginatedEssays.map((essay) => (
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
                          {essay.createdAt ? new Date(essay.createdAt).toLocaleDateString('pt-BR') : ''}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '1.5rem', 
                  marginTop: '3rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid var(--line-color)'
                }}
              >
                {page > 1 ? (
                  <Link 
                    href={`/history?page=${page - 1}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      border: '1px solid var(--line-color)',
                      background: '#ffffff',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </Link>
                ) : (
                  <span 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: 'not-allowed'
                    }}
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </span>
                )}

                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Página {page} de {totalPages}
                </span>

                {page < totalPages ? (
                  <Link 
                    href={`/history?page=${page + 1}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      border: '1px solid var(--line-color)',
                      background: '#ffffff',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    Próximo
                    <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: 'not-allowed'
                    }}
                  >
                    Próximo
                    <ChevronRight size={16} />
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
