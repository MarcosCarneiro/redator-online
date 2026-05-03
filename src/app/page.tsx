'use client';

import { useState, useRef, useEffect } from 'react';
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
import { FeedbackPrompt } from '@/components/FeedbackPrompt';

// Hooks
import { useEssayEditor } from '@/hooks/useEssayEditor';
import { useEssayActions } from '@/hooks/useEssayActions';
import { authClient } from '@/lib/auth-client';

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

  // State & Logic via Hooks
  const { 
    essay, setEssay, 
    theme, setTheme, 
    wordCount, lineEstimate 
  } = useEssayEditor();

  const {
    loading, transcribing, 
    evaluation, setEvaluation,
    error, limitReached, 
    authRequired, freeLimit,
    handleImageUpload, handleSubmit
  } = useEssayActions({ essay, theme, setEssay });
  
  // Refs
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to results when they arrive
  useEffect(() => {
    if (evaluation && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [evaluation]);

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

          {error && authRequired && !session && (
            <FeedbackPrompt type="auth" freeLimit={freeLimit} />
          )}

          {error && limitReached && (
            <FeedbackPrompt type="limit" />
          )}

          {error && !limitReached && !authRequired && (
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
