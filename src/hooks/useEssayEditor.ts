import { useState, useEffect, useRef } from 'react';

export function useEssayEditor() {
  const [essay, setEssay] = useState('');
  const [theme, setTheme] = useState('');
  const isInitialMount = useRef(true);

  // Persistence (Drafts)
  useEffect(() => {
    const savedEssay = localStorage.getItem('redator_draft');
    const savedTheme = localStorage.getItem('redator_theme');
    
    if (savedEssay || savedTheme) {
      requestAnimationFrame(() => {
        if (savedEssay) setEssay(savedEssay);
        if (savedTheme) setTheme(savedTheme);
      });
    }
    
    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;
    localStorage.setItem('redator_draft', essay);
    localStorage.setItem('redator_theme', theme);
  }, [essay, theme]);

  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length;
  const lineEstimate = Math.max(0, Math.ceil(essay.split('\n').length + (essay.length / 80)));

  return {
    essay,
    setEssay,
    theme,
    setTheme,
    wordCount,
    lineEstimate
  };
}
