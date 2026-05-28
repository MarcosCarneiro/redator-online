import { Sparkles, Brain, Check, Award } from 'lucide-react';

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
      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary-premium" onClick={onStartClick}>
          Começar agora
        </button>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.2rem' }}>🚀</span> +15k redações corrigidas este mês
        </div>
      </div>
    </div>
    <div className="hero-image">
      <div className="hero-illustration">
        <div className="hero-glow-bg" />
        
        {/* Mockup 3D Translúcido / Glassmorphism */}
        <div className="floating-sheet">
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginLeft: 'auto' }}>
              ENEM 2026
            </div>
          </div>
          
          <div className="floating-sheet-line" style={{ width: '85%' }} />
          <div className="floating-sheet-line" style={{ width: '95%' }} />
          <div className="floating-sheet-line" style={{ width: '70%' }} />
          <div className="floating-sheet-line" style={{ width: '90%' }} />
          <div className="floating-sheet-line" style={{ width: '80%' }} />
          <div className="floating-sheet-line" style={{ width: '65%' }} />
          <div className="floating-sheet-line" style={{ width: '75%' }} />
          <div className="floating-sheet-line" style={{ width: '45%' }} />
        </div>

        {/* Orbiting Glassmorphic Badges */}
        <div className="hero-floating-badge badge-score">
          <Sparkles size={15} style={{ fill: 'rgba(255,255,255,0.2)' }} />
          <span>Nota 1000</span>
        </div>

        <div className="hero-floating-badge badge-c1">
          <Check size={14} strokeWidth={3} />
          <span>C1: Excelente</span>
        </div>

        <div className="hero-floating-badge badge-ia">
          <Brain size={14} />
          <span>IA Scanner</span>
        </div>

        <div className="hero-floating-badge badge-spark">
          <Award size={14} />
          <span>Proposta Nota 200</span>
        </div>
      </div>
    </div>
  </section>
);
