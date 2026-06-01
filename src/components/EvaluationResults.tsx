'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Lightbulb, FileText, Download, ChevronDown } from 'lucide-react';

interface Competency {
  name: string;
  score: number;
  explanation: string;
  tips: string;
}

interface Evaluation {
  totalScore: number;
  competencies: Competency[];
  generalFeedback: string;
}

interface EvaluationResultsProps {
  evaluation: Evaluation;
  theme: string;
  essay: string;
  resultsRef?: React.RefObject<HTMLDivElement | null>;
}

const getScoreTheme = (score: number) => {
  if (score >= 900) {
    return {
      startColor: '#10b981', // Verde Esmeralda (Excelente)
      endColor: '#06b6d4',   // Ciano/Teal
      textColor: '#047857',
    };
  }
  if (score >= 700) {
    return {
      startColor: '#4f46e5', // Índigo/Azul Escuro (Bom)
      endColor: '#3b82f6',   // Azul Principal
      textColor: '#1d4ed8',
    };
  }
  if (score >= 500) {
    return {
      startColor: '#f59e0b', // Âmbar (Regular)
      endColor: '#ea580c',   // Laranja
      textColor: '#b45309',
    };
  }
  return {
    startColor: '#f43f5e', // Rose/Vermelho (Alerta)
    endColor: '#be123c',   // Crimson
    textColor: '#b91c1c',
  };
};

// Subcomponente Modular para gerenciar o Accordion e a Gauge de cada competência individualmente
const CompetencyCard = ({ comp, index }: { comp: Competency; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 160) return '#10b981'; // Emerald Green
    if (score >= 120) return '#f59e0b'; // Amber Yellow
    return '#f97316'; // Orange Warning
  };

  const getScoreBg = (score: number) => {
    if (score >= 160) return 'rgba(16, 185, 129, 0.08)';
    if (score >= 120) return 'rgba(245, 158, 11, 0.08)';
    return 'rgba(249, 115, 22, 0.08)';
  };

  return (
    <div className={`comp-card-premium ${isOpen ? 'open' : ''}`}>
      <div 
        className="comp-card-header" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
          <div 
            className="comp-icon-wrapper" 
            style={{ 
              color: getScoreColor(comp.score), 
              background: getScoreBg(comp.score), 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0 
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.075em' }}>
              Competência {index + 1}
            </h4>
            <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
              {comp.name}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Circular progress gauge */}
          <div className="comp-gauge-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="19" fill="transparent" stroke="#f1f5f9" strokeWidth="3.5" />
              <circle 
                cx="24" 
                cy="24" 
                r="19" 
                fill="transparent" 
                stroke={getScoreColor(comp.score)} 
                strokeWidth="3.5" 
                strokeDasharray="119.38" 
                strokeDashoffset={119.38 - (119.38 * (comp.score / 200))}
                strokeLinecap="round"
                transform="rotate(-90 24 24)"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <text 
                x="24" 
                y="27.5" 
                textAnchor="middle" 
                fontWeight="900" 
                fontSize="9" 
                fill="#1e293b"
              >
                {comp.score}
              </text>
            </svg>
          </div>

          <div className="comp-chevron-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
            <ChevronDown size={20} className="comp-chevron" />
          </div>
        </div>
      </div>

      <div className="comp-card-body-wrapper">
        <div className="comp-card-body">
          <div style={{ padding: '0 2rem 2rem' }}>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
              {comp.explanation}
            </p>
            <div className="comp-tips-box">
              <Lightbulb size={18} style={{ flexShrink: 0, color: '#fbbf24', marginTop: '2px' }} />
              <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#451a03' }}>
                <strong style={{ color: '#78350f' }}>Como melhorar:</strong> {comp.tips}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EvaluationResults = ({ evaluation, theme, essay, resultsRef }: EvaluationResultsProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const scoreTheme = getScoreTheme(evaluation.totalScore);

  useEffect(() => {
    const mountTimer = setTimeout(() => {
      setIsMounted(true);
    }, 150);
    return () => clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1800; // 1.8 segundos
    const startValue = 0;
    const endValue = evaluation.totalScore;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing cúbico ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.floor(easeProgress * (endValue - startValue) + startValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setAnimatedScore(endValue);
      }
    };

    const animTimer = setTimeout(() => {
      window.requestAnimationFrame(step);
    }, 150);

    return () => {
      clearTimeout(animTimer);
    };
  }, [evaluation.totalScore]);

  return (
    <div className="results-section" ref={resultsRef || null}>
      <div className="print-only">
        <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Relatório de Avaliação - Redator Online</h1>
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Tema:</h2>
          <p style={{ fontWeight: 600 }}>{theme}</p>
        </div>
        
        <div style={{ marginBottom: '3rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Sua Redação:</h2>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>{essay}</p>
        </div>
        <hr style={{ margin: '2rem 0', border: '0', borderTop: '2px solid #e2e8f0' }} />
      </div>

      <div className="score-hero">
        <div className="score-ring-wrapper">
          <svg className="score-ring-svg" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={scoreTheme.startColor} />
                <stop offset="100%" stopColor={scoreTheme.endColor} />
              </linearGradient>
            </defs>
            
            {/* Círculo do fundo */}
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              stroke="#f1f5f9" 
              strokeWidth="12" 
              fill="transparent" 
            />
            
            {/* Círculo dinâmico animado */}
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              stroke="url(#scoreGradient)" 
              strokeWidth="12" 
              fill="transparent" 
              strokeDasharray="502.65" 
              strokeDashoffset={502.65 - (502.65 * (animatedScore / 1000))} 
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          
          <div className="score-inner-glass">
            <span className="score-lbl">Nota Final</span>
            <span 
              className="score-val"
              style={{
                background: `linear-gradient(135deg, ${scoreTheme.startColor} 0%, ${scoreTheme.endColor} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {animatedScore}
            </span>
          </div>

          {/* Efeito de faíscas/confete para notas excelentes >= 900 */}
          {evaluation.totalScore >= 900 && isMounted && (
            <div className="confetti-container">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`sparkle sparkle-${i}`} />
              ))}
            </div>
          )}
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.025em' }}>
          Sua Análise está pronta!
        </h2>
      </div>

      <div className="competency-grid" style={{ maxWidth: '800px', margin: '0 auto 4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {evaluation.competencies.map((comp, index) => (
          <CompetencyCard key={index} comp={comp} index={index} />
        ))}
      </div>

      <div className="feedback-box">
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} />
          Resumo Estrutural
        </h3>
        <p style={{ color: 'var(--text-dark)', lineHeight: 1.8, margin: 0 }}>{evaluation.generalFeedback}</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <button className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => window.print()}>
          <Download size={20} />
          Exportar Relatório em PDF
        </button>
      </div>
    </div>
  );
};
