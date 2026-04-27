'use client';

import { CheckCircle2, Lightbulb, FileText, Download } from 'lucide-react';

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

export const EvaluationResults = ({ evaluation, theme, essay, resultsRef }: EvaluationResultsProps) => {
  const getScoreClass = (score: number) => {
    if (score <= 80) return 'bar-low';
    if (score <= 160) return 'bar-mid';
    return 'bar-high';
  };

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
        <div className="score-circle">
          <span className="lbl">Nota Final</span>
          <span className="val">{evaluation.totalScore}</span>
        </div>
        <h2 style={{ fontSize: '2.5rem' }}>Sua Análise está pronta!</h2>
      </div>

      <div className="competency-grid">
        {evaluation.competencies.map((comp, index) => (
          <div key={index} className="comp-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} />
                {comp.name}
              </h3>
              <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{comp.score} pts</span>
            </div>
            <div className="comp-progress">
              <div 
                className={`comp-bar ${getScoreClass(comp.score)}`}
                style={{ width: `${(comp.score / 200) * 100}%` }}
              ></div>
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              {comp.explanation}
            </p>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px dashed #e2e8f0', fontSize: '0.9rem', display: 'flex', gap: '12px' }}>
              <Lightbulb size={20} style={{ flexShrink: 0, color: '#f59e0b' }} />
              <div>
                <strong>Como melhorar:</strong> {comp.tips}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="feedback-box">
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} />
          Resumo Estrutural
        </h3>
        <p style={{ color: 'var(--text-dark)', lineHeight: 1.8 }}>{evaluation.generalFeedback}</p>
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
