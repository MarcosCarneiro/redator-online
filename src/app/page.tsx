'use client';

import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { AlertCircle } from 'lucide-react';

// Components
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { BentoGrid } from '@/components/BentoGrid';
import { EssayEditor } from '@/components/EssayEditor';
import { EvaluationResults } from '@/components/EvaluationResults';
import { AnalysisLoading } from '@/components/AnalysisLoading';
import { Pricing } from '@/components/Pricing';
import { authClient } from '@/lib/auth-client';

// Types
import { Evaluation } from '@/lib/types';

export default function Home() {
  const { data: session } = authClient.useSession();
  const [usage, setUsage] = useState<{ planName: string } | null>(null);

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

  const hasPaidPlan = usage && usage.planName !== 'Grátis';

  // State Management
  const [essay, setEssay] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  
  // Refs
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Persistence (Drafts)
  useEffect(() => {
    const savedEssay = localStorage.getItem('redator_draft');
    const savedTheme = localStorage.getItem('redator_theme');
    
    // Use requestAnimationFrame to defer state updates and avoid cascading renders lint error
    if (savedEssay || savedTheme) {
      requestAnimationFrame(() => {
        if (savedEssay) setEssay(savedEssay);
        if (savedTheme) setTheme(savedTheme);
      });
    }
    
    // Mark as initialized
    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;
    
    localStorage.setItem('redator_draft', essay);
    localStorage.setItem('redator_theme', theme);
  }, [essay, theme]);

  // Scroll to results when they arrive
  useEffect(() => {
    if (evaluation && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [evaluation]);

  // Derived Business Logic
  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length;
  const lineEstimate = Math.max(0, Math.ceil(essay.split('\n').length + (essay.length / 80)));

  // API Interaction Handlers
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTranscribing(true);
    setError(null);

    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64data }),
        });

        if (!response.ok) throw new Error('Falha ao transcrever a imagem.');
        const data = await response.json();
        setEssay(prev => prev + (prev ? '\n\n' : '') + data.text);
        setTranscribing(false);
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar imagem';
      setError(message);
      setTranscribing(false);
    }
  };

  const handleSubmit = async () => {
    if (!theme.trim()) {
      setError('Por favor, informe o tema da redação antes de avaliar.');
      document.getElementById('theme-input')?.focus();
      return;
    }

    if (!essay.trim() || essay.trim().length < 150) {
      setError('Sua redação precisa ter pelo menos 150 caracteres para uma avaliação precisa.');
      return;
    }

    setLoading(true);
    setError(null);
    setEvaluation(null);
    setLimitReached(false);
    
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: essay, theme: theme }),
      });
      
      if (response.status === 429) {
        throw new Error('Muitas requisições. Descanse um pouco e tente novamente mais tarde!');
      }
      
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 403) {
          setLimitReached(true);
        }
        throw new Error(data.error || 'Falha ao processar a redação.');
      }
      
      setEvaluation(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      {loading && <AnalysisLoading />}

      <div className="container">
        <Hero onStartClick={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })} />
        <BentoGrid />
        {!hasPaidPlan && <Pricing />}

        <main>
          <EssayEditor 
            theme={theme} setTheme={setTheme}
            essay={essay} setEssay={setEssay}
            loading={loading} transcribing={transcribing}
            onImageUpload={handleImageUpload}
            onSubmit={handleSubmit}
            wordCount={wordCount}
            lineEstimate={lineEstimate}
            fileInputRef={fileInputRef}
          />

          {error && limitReached && !session && (
            <div style={{ textAlign: 'center', background: '#eff6ff', padding: '2.5rem', borderRadius: '24px', marginTop: '2rem', border: '2px solid #bfdbfe' }}>
              <h3 style={{ color: '#1e3a8a', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>Limite Gratuito Atingido 🚀</h3>
              <p style={{ color: '#3b82f6', marginBottom: '2rem', fontSize: '1.1rem' }}>
                Você já usou todas as suas correções gratuitas como visitante. Assine um de nossos planos ou crie uma conta para continuar evoluindo!
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="#planos" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem' }}>
                  Ver Planos
                </a>
                <button className="btn-secondary" onClick={() => authClient.signIn.social({ provider: "google" })} style={{ padding: '0.8rem 2rem' }}>
                  Criar Conta Grátis
                </button>
              </div>
            </div>
          )}

          {error && (!limitReached || session) && (
            <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '2rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {evaluation && (
            <EvaluationResults 
              evaluation={evaluation} 
              theme={theme}
              essay={essay}
              resultsRef={resultsRef} 
            />
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}
