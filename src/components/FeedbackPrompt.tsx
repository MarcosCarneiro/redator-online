import { authClient } from '@/lib/auth-client';

interface FeedbackPromptProps {
  type: 'auth' | 'limit';
  freeLimit?: number;
}

export function FeedbackPrompt({ type, freeLimit }: FeedbackPromptProps) {
  if (type === 'auth') {
    return (
      <div style={{ textAlign: 'center', background: '#eff6ff', padding: '2.5rem', borderRadius: '24px', marginTop: '2rem', border: '2px solid #bfdbfe' }}>
        <h3 style={{ color: '#1e3a8a', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>Faça login para continuar 🚀</h3>
        <p style={{ color: '#3b82f6', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Crie sua conta gratuitamente ou faça login para ganhar {freeLimit || 3} avaliações de redação e ter acesso as ferramentas da plataforma!
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={() => authClient.signIn.social({ provider: "google" })} 
            style={{ padding: '0.8rem 2rem' }}
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', background: '#eff6ff', padding: '2.5rem', borderRadius: '24px', marginTop: '2rem', border: '2px solid #bfdbfe' }}>
      <h3 style={{ color: '#1e3a8a', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>Limite Atingido 🚀</h3>
      <p style={{ color: '#3b82f6', marginBottom: '2rem', fontSize: '1.1rem' }}>
        Você já usou todas as suas correções do seu plano atual. Assine um plano para continuar evoluindo!
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="#planos" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem' }}>
          Ver Planos
        </a>
      </div>
    </div>
  );
}
