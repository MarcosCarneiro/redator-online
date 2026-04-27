'use client';

import { useState, useRef, useEffect } from 'react';

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

export default function Home() {
  const [essay, setEssay] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Carregar rascunho salvo ao iniciar
  useEffect(() => {
    const savedEssay = localStorage.getItem('redator_draft');
    const savedTheme = localStorage.getItem('redator_theme');
    if (savedEssay) setEssay(savedEssay);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Salvar rascunho automaticamente
  useEffect(() => {
    localStorage.setItem('redator_draft', essay);
    localStorage.setItem('redator_theme', theme);
  }, [essay, theme]);

  useEffect(() => {
    if (evaluation && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [evaluation]);

  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length;
  const lineEstimate = Math.max(0, Math.ceil(essay.split('\n').length + (essay.length / 80)));

  const handleSubmit = async () => {
    if (!essay.trim() || !theme.trim()) return;

    setLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: essay, theme: theme }),
      });

      if (!response.ok) {
        throw new Error('Falha ao processar a redação. Tente novamente.');
      }

      const data = await response.json();
      setEvaluation(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score: number) => {
    if (score <= 80) return 'score-low';
    if (score <= 160) return 'score-mid';
    return 'score-high';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <a href="#" className="logo">Redator<span>Online</span></a>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Plataforma Digital de Correção
          </div>
        </div>
      </nav>

      <div className="container">
        <section className="hero">
          <div className="hero-text">
            <h1>Sua nota 1000 começa <span>aqui.</span></h1>
            <p>
              Pratique sua redação com temas atuais e receba feedback instantâneo 
              baseado nos critérios oficiais do ENEM através da nossa Inteligência Artificial.
            </p>
          </div>
          <div className="hero-image">
            <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
              <rect x="100" y="100" width="300" height="350" rx="20" fill="#fff" stroke="#6c5ce7" strokeWidth="4"/>
              <line x1="140" y1="180" x2="360" y2="180" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round"/>
              <line x1="140" y1="230" x2="360" y2="230" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round"/>
              <line x1="140" y1="280" x2="300" y2="280" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round"/>
              <path d="M380 150 L420 110 L440 130 L400 170 Z" fill="#6c5ce7"/>
              <circle cx="250" cy="400" r="30" fill="#a29bfe" opacity="0.3"/>
              <rect x="350" y="320" width="80" height="100" rx="10" fill="#6c5ce7" opacity="0.1"/>
            </svg>
          </div>
        </section>

        <main>
          <div className="theme-input-container">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              TEMA DA REDAÇÃO
            </label>
            <input
              type="text"
              className="theme-input"
              placeholder="Digite ou cole aqui o tema proposto..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
            SUA REDAÇÃO
          </div>
          <div className="notebook-wrapper">
            <div className="notebook">
              <div className="lines">
                <textarea
                  className="essay-textarea"
                  placeholder="Inicie sua redação com uma introdução impactante..."
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="status-bar">
              <div className="status-item">Palavras: <span>{wordCount}</span></div>
              <div className="status-item">Linhas (est.): <span style={{ color: lineEstimate < 7 ? 'var(--score-low)' : 'var(--primary)' }}>{lineEstimate} / 30</span></div>
              <div className="status-item" style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
                {essay.length > 0 ? 'Rascunho salvo automaticamente' : 'Comece a escrever para salvar'}
              </div>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={loading || !essay.trim() || !theme.trim()}
            >
              {loading ? 'Processando...' : 'Avaliar Redação'}
            </button>
            
            {evaluation && (
              <button className="btn-print" onClick={handlePrint}>
                Salvar em PDF
              </button>
            )}
          </div>

          {error && (
            <div style={{ color: '#e74c3c', textAlign: 'center', marginTop: '1rem', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="loading-container" style={{ textAlign: 'center', marginTop: '2rem' }}>
              <div className="spinner"></div>
              <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Nossa IA está analisando sua redação...
              </p>
            </div>
          )}

          {evaluation && (
            <div className="results" ref={resultsRef}>
              <h2 style={{ color: 'var(--text-main)' }}>Análise Detalhada</h2>
              
              <div className="final-score-circle">
                <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Nota Total</span>
                <span className="number">{evaluation.totalScore}</span>
              </div>

              {evaluation.competencies.map((comp, index) => (
                <div key={index} className="competency-card">
                  <div className="comp-info">
                    <h3 style={{ fontSize: '1.2rem' }}>{comp.name}</h3>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>
                      {comp.score} <span style={{ color: '#cbd5e0', fontSize: '1rem' }}>/ 200</span>
                    </span>
                  </div>
                  
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill ${getScoreClass(comp.score)}`}
                      style={{ width: `${(comp.score / 200) * 100}%` }}
                    ></div>
                  </div>

                  <p style={{ lineHeight: '1.7', color: 'var(--text-muted)' }}>{comp.explanation}</p>
                  
                  <div className="tip-box">
                    <strong style={{ color: '#0369a1' }}>🎯 Dica do Especialista:</strong> {comp.tips}
                  </div>
                </div>
              ))}
              
              <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-color)', borderRadius: '12px', borderLeft: '6px solid var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Feedback Geral</h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-main)' }}>{evaluation.generalFeedback}</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        &copy; 2026 Redator Online - Prática de Redação para o ENEM
      </footer>
    </>
  );
}
