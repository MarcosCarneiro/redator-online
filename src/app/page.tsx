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

  useEffect(() => {
    const savedEssay = localStorage.getItem('redator_draft');
    const savedTheme = localStorage.getItem('redator_theme');
    if (savedEssay) setEssay(savedEssay);
    if (savedTheme) setTheme(savedTheme);
  }, []);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: essay, theme: theme }),
      });

      if (response.status === 429) {
        throw new Error('Você atingiu o limite de 3 correções por hora. Descanse um pouco e volte logo!');
      }

      if (!response.ok) throw new Error('Falha ao processar a redação. Verifique sua conexão.');
      
      const data = await response.json();
      setEvaluation(data);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score: number) => {
    if (score <= 80) return 'bar-low';
    if (score <= 160) return 'bar-mid';
    return 'bar-high';
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <a href="#" className="logo">
            <div className="logo-dot"></div>
            Redator<span>Online</span>
          </a>
          <div className="nav-links">
            <a>Metodologia</a>
            <a>Temas</a>
            <a>Planos</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <div className="badge-new">
            <span>✨</span> Nova IA Corretora 2026
          </div>
          <h1>Alcance a sua <span>Nota 1000</span> com IA.</h1>
          <p>
            A plataforma mais avançada de correção de redação. 
            Feedback instantâneo, técnico e humanizado seguindo os critérios oficiais do INEP.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn-primary" onClick={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })}>
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

      <section className="bento-grid">
        <div className="bento-item">
          <div className="bento-icon">🎯</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Critérios Oficiais</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
            Avaliação baseada nas 5 competências exigidas pela banca do ENEM.
          </p>
        </div>
        <div className="bento-item">
          <div className="bento-icon">⚡</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Resultado Instantâneo</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
            Sua correção detalhada fica pronta em menos de 10 segundos.
          </p>
        </div>
        <div className="bento-item">
          <div className="bento-icon">💡</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Dicas de Mestre</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
            Sugestões personalizadas para você evoluir em cada competência.
          </p>
        </div>
      </section>

      <div className="editor-container" id="editor">
        <div className="input-group">
          <label className="input-label">Tema da Redação</label>
          <input
            type="text"
            className="theme-input"
            placeholder="Ex: Os desafios da educação inclusiva no Brasil..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Seu Texto</label>
          <div className="notebook-card">
            <div className="notebook-header">
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }}></div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>MODO ESCRITA ATIVO</div>
            </div>
            <div className="notebook-body">
              <div className="lines-container">
                <textarea
                  className="essay-textarea"
                  placeholder="Escreva sua redação aqui..."
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="status-bar">
              <div>Palavras: <span>{wordCount}</span></div>
              <div>Linhas (est.): <span style={{ color: lineEstimate < 7 ? '#ef4444' : 'inherit' }}>{lineEstimate} / 30</span></div>
              <div style={{ marginLeft: 'auto', opacity: 0.6 }}>Autosave on</div>
            </div>
          </div>
        </div>

        <div className="actions">
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading || !essay.trim() || !theme.trim()}
          >
            {loading ? 'Analisando...' : 'Finalizar e Corrigir'}
          </button>
        </div>

        {error && (
          <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '2rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {evaluation && (
          <div className="results-section" ref={resultsRef}>
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
                    <h3 style={{ color: 'var(--primary)' }}>{comp.name}</h3>
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
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
                    <strong>🎯 Como melhorar:</strong> {comp.tips}
                  </div>
                </div>
              ))}
            </div>

            <div className="feedback-box">
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Resumo Estrutural</h3>
              <p style={{ color: 'var(--text-dark)', lineHeight: 1.8 }}>{evaluation.generalFeedback}</p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <button className="btn-secondary" onClick={() => window.print()}>
                Exportar Relatório em PDF
              </button>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: '#f8fafc', padding: '4rem 2rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          <div className="logo-dot"></div>
          Redator<span>Online</span>
        </div>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
          &copy; 2026 Redator Online. A melhor tecnologia para o seu futuro.
        </p>
      </footer>
    </>
  );
}
