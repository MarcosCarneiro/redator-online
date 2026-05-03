import { useState } from 'react';
import { Evaluation } from '@/lib/types';
import { compressAndConvertToBase64 } from '@/lib/image-utils';

interface UseEssayActionsProps {
  essay: string;
  theme: string;
  setEssay: (text: string | ((prev: string) => string)) => void;
}

export function useEssayActions({ essay, theme, setEssay }: UseEssayActionsProps) {
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [freeLimit, setFreeLimit] = useState(3);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTranscribing(true);
    setError(null);
    setAuthRequired(false);

    try {
      const base64data = await compressAndConvertToBase64(file);
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64data }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setAuthRequired(true);
          if (data.freeLimit) setFreeLimit(data.freeLimit);
        }
        if (response.status === 403) {
          setLimitReached(true);
        }
        throw new Error(data.error || 'Falha ao transcrever a imagem.');
      }
      
      setEssay(prev => prev + (prev ? '\n\n' : '') + data.text);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar imagem';
      setError(message);
    } finally {
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
    setAuthRequired(false);
    
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: essay, theme: theme }),
      });
      
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setAuthRequired(true);
          if (data.freeLimit) setFreeLimit(data.freeLimit);
        }
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

  return {
    loading,
    transcribing,
    evaluation,
    setEvaluation,
    error,
    setError,
    limitReached,
    authRequired,
    freeLimit,
    handleImageUpload,
    handleSubmit
  };
}
