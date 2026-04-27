import { Sparkles } from 'lucide-react';

export const Hero = ({ onStartClick }: { onStartClick: () => void }) => (
  <section className="hero">
    <div className="hero-text">
      <div className="badge-new">
        <Sparkles size={16} /> Nova IA Corretora 2026
      </div>
      <h1>Alcance a sua <span>Nota 1000</span> com IA.</h1>
      <p>
        A plataforma mais avançada de correção de redação. 
        Envie uma foto da sua folha ou escreva diretamente no nosso editor.
      </p>
      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button className="btn-primary" onClick={onStartClick}>
          Começar agora
        </button>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>
          🚀 +15k redações corrigidas este mês
        </div>
      </div>
    </div>
    <div className="hero-image">
      <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))' }}>
        <rect x="50" y="50" width="400" height="400" rx="40" fill="#fff" />
        <path d="M150 150 H350" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" />
        <path d="M150 220 H350" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" />
        <path d="M150 290 H280" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" />
        <circle cx="380" cy="380" r="50" fill="var(--primary-light)" />
        <path d="M365 380 L375 390 L395 370" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </section>
);
