'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles, Rocket, Zap } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Plan {
  id: string;
  name: string;
  price: string;
  essayLimit: number;
}

export const Pricing = () => {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [dbPlans, setDbPlans] = useState<Plan[]>([]);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // The API already filtered to only allowed plans, 
          // we just ensure the exact order (pro_10 -> pro_100)
          const order = ['pro_10', 'pro_100'];
          const sorted = data.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
          setDbPlans(sorted);
        }
      })
      .catch(console.error)
      .finally(() => setFetchingPlans(false));
  }, []);

  const handleSubscription = async (planId: string) => {
    if (!session) {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/planos",
      });
      return;
    }

    setLoading(planId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || 'Erro ao iniciar checkout');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  const getPlanDetails = (plan: Plan) => {
    if (plan.id === 'pro_100') {
      return {
        features: [
          `${plan.essayLimit} correções por mês`,
          'Análise ultra-detalhada',
          'Foco total na Nota 1000',
          'Transcrição ilimitada de fotos',
          'Dicas exclusivas de repertório'
        ],
        icon: <Rocket className="text-blue-500" size={24} />,
        popular: true
      };
    }
    return {
      features: [
        `${plan.essayLimit} correções por mês`,
        'Feedback detalhado por competência',
        'Sugestões de melhoria (IA)',
        'Histórico completo salvo'
      ],
      icon: <Zap className="text-amber-500" size={24} />,
      popular: false
    };
  };

  return (
    <section className="pricing-section" id="planos">
      <div className="container">
        <div className="pricing-header">
          <div className="badge-new" style={{ margin: '0 auto 1.5rem' }}>
            <Sparkles size={16} /> PREÇO DE LANÇAMENTO
          </div>
          <h2>Escolha o seu plano</h2>
          <p>Invista na sua aprovação com o melhor custo-benefício do Brasil.</p>
        </div>

        {fetchingPlans ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
            Carregando planos...
          </div>
        ) : (
          <div className="pricing-grid">
            {dbPlans.map((plan) => {
              const details = getPlanDetails(plan);
              const formattedPrice = (Number(plan.price) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
              
              return (
                <div key={plan.id} className={`pricing-card ${details.popular ? 'popular' : ''}`}>
                  {details.popular && <div className="popular-badge">MAIS ESCOLHIDO</div>}
                  <div className="card-header">
                    <div className="plan-icon">{details.icon}</div>
                    <h3>{plan.name}</h3>
                    <div className="price">
                      <span className="currency">R$</span>
                      <span className="amount">{formattedPrice}</span>
                      <span className="period">/mês</span>
                    </div>
                  </div>

                  <ul className="features-list">
                    {details.features.map((feature, i) => (
                      <li key={i}>
                        <Check size={18} className="check-icon" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`btn-subscribe ${details.popular ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleSubscription(plan.id)}
                    disabled={loading !== null}
                  >
                    {loading === plan.id ? 'Carregando...' : 'Assinar Agora'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        <p className="pricing-footer">
          Pagamento seguro via <strong>Stripe</strong>. Cancele quando quiser.
        </p>
      </div>

      <style jsx>{`
        .pricing-section {
          padding: 6rem 0;
          background: linear-gradient(to bottom, #fcfdfe, #f8fafc);
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .pricing-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 1rem;
        }

        .pricing-header p {
          color: var(--text-light);
          font-size: 1.1rem;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .pricing-card {
          background: white;
          border-radius: 32px;
          padding: 3rem 2.5rem;
          border: 2px solid #f1f5f9;
          position: relative;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .pricing-card:hover {
          transform: translateY(-10px);
          border-color: var(--primary-light);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
        }

        .pricing-card.popular {
          border-color: var(--primary);
          box-shadow: 0 20px 25px -5px rgba(30, 58, 138, 0.1);
        }

        .popular-badge {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: white;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .card-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .plan-icon {
          width: 64px;
          height: 64px;
          background: #f8fafc;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .pricing-card.popular .plan-icon { background: #eff6ff; }

        .price {
          margin-top: 1rem;
          display: flex;
          align-items: baseline;
          justify-content: center;
        }

        .currency { font-size: 1.25rem; fontWeight: 700; color: var(--text-dark); margin-right: 4px; }
        .amount { font-size: 3.5rem; fontWeight: 800; color: var(--text-dark); line-height: 1; }
        .period { color: var(--text-light); font-weight: 600; margin-left: 4px; }

        .features-list {
          list-style: none;
          margin-bottom: 3rem;
          flex: 1;
        }

        .features-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-dark);
          font-weight: 500;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .check-icon { color: var(--success); flex-shrink: 0; }

        .btn-subscribe {
          width: 100%;
          padding: 1.25rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pricing-footer {
          text-align: center;
          margin-top: 3rem;
          color: var(--text-light);
          font-size: 0.9rem;
        }
      `}</style>
    </section>
  );
};
