'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { authClient } from '@/lib/auth-client';
import { CreditCard, Calendar, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface UserUsage {
  essaysUsed: number;
  essayLimit: number;
  planName: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
}

export default function BillingPage() {
  const { data: session, isPending } = authClient.useSession();
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetch('/api/user/usage')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setUsage(data);
        })
        .catch(console.error);
    }
  }, [session]);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    setError(null);
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Erro ao abrir o portal de faturamento.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoadingPortal(false);
    }
  };

  if (isPending) return null;

  if (!session) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
          <h1>Acesso Restrito</h1>
          <p>Você precisa estar logado para gerenciar sua assinatura.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem', textDecoration: 'none' }}>
            Voltar para Home
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <header style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
              Assinatura e Faturamento
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
              Gerencie seu plano, faturas e métodos de pagamento.
            </p>
          </header>

          <div className="billing-grid">
            {/* Current Plan Card */}
            <div className="billing-card main">
              <div className="card-header">
                <div className="icon-badge">
                  <CreditCard size={24} />
                </div>
                <div>
                  <span className="badge">Plano Atual</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    {usage?.planName || 'Carregando...'}
                  </h2>
                </div>
              </div>

              <div className="card-body">
                <div className="usage-stats">
                  <div className="stat-item">
                    <span className="label">Uso de Redações</span>
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${Math.min(100, ((usage?.essaysUsed || 0) / (usage?.essayLimit || 1)) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="value">{usage?.essaysUsed} / {usage?.essayLimit} utilizadas</span>
                  </div>
                </div>

                {usage?.subscriptionExpiresAt && (
                  <div className="info-row">
                    <Calendar size={18} />
                    <span>
                      Renova em: <strong>{new Date(usage.subscriptionExpiresAt).toLocaleDateString('pt-BR')}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                {usage && usage.planName !== 'Grátis' ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleManageSubscription}
                    disabled={loadingPortal}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {loadingPortal ? 'Carregando...' : (
                      <>
                        Gerenciar no Stripe <ExternalLink size={18} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link href="/#planos" className="btn-primary" style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Fazer Upgrade <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>

            {/* Status & Info Card */}
            <div className="billing-card side">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Status da Conta</h3>
              
              <ul className="status-list">
                <li>
                  <CheckCircle2 size={18} className="icon-success" />
                  <span>Conta verificada</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="icon-success" />
                  <span>Histórico ativado</span>
                </li>
                {usage && usage.planName !== 'Grátis' && (
                  <li>
                    <CheckCircle2 size={18} className="icon-success" />
                    <span>Pagamento automático</span>
                  </li>
                )}
              </ul>

              {error && (
                <div className="error-box">
                  <AlertCircle size={18} />
                  <p>{error}</p>
                </div>
              )}

              <div className="help-box">
                <p>Precisa de ajuda com faturamento?</p>
                <a href="mailto:suporte@redator.online">Contatar Suporte</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .billing-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .billing-grid { grid-template-columns: 1fr; }
        }

        .billing-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .billing-card.main {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-badge {
          width: 56px;
          height: 56px;
          background: #eff6ff;
          color: var(--primary);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--primary);
          margin-bottom: 4px;
        }

        .usage-stats {
          margin-bottom: 1.5rem;
        }

        .stat-item .label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-light);
          margin-bottom: 0.75rem;
        }

        .progress-container {
          height: 10px;
          background: #f1f5f9;
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-bar {
          height: 100%;
          background: var(--primary);
          border-radius: 100px;
        }

        .stat-item .value {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-light);
          font-size: 0.95rem;
        }

        .status-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-dark);
        }

        .icon-success { color: var(--success); }

        .error-box {
          margin-top: 1.5rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          gap: 10px;
          color: #dc2626;
        }

        .error-box p { font-size: 0.85rem; font-weight: 600; margin: 0; }

        .help-box {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #f1f5f9;
        }

        .help-box p {
          font-size: 0.9rem;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }

        .help-box a {
          color: var(--primary);
          font-weight: 700;
          text-decoration: none;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}
