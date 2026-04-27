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

// Types
export interface Competency {
  name: string;
  score: number;
  explanation: string;
  tips: string;
}

export interface Evaluation {
  totalScore: number;
  competencies: Competency[];
  generalFeedback: string;
}

export default function Home() {
  // State Management
  const [essay, setEssay] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence (Drafts)
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
    } catch (err: any) {
      setError('Erro ao processar imagem: ' + err.message);
      setTranscribing(false);
    }
  };

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
        throw new Error('Você atingiu o limite de 3 correções por hora. Descanse um pouco!');
      }
      
      if (!response.ok) throw new Error('Falha ao processar a redação.');
      
      const data = await response.json();
      setEvaluation(data);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <Hero onStartClick={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })} />
        <BentoGrid />

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

          {error && (
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
