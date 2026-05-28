import { useState, useEffect, useRef } from 'react';

export function useEssayEditor() {
  const [essay, setEssay] = useState('');
  const [theme, setTheme] = useState('');
  const [fontFamily, setFontFamily] = useState<'kalam' | 'sans'>('kalam');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isInitialMount = useRef(true);

  // Persistence (Drafts & Font Family) on Mount
  useEffect(() => {
    const savedEssay = localStorage.getItem('redator_draft');
    const savedTheme = localStorage.getItem('redator_theme');
    const savedFont = localStorage.getItem('redator_font_family');
    
    if (savedEssay || savedTheme || savedFont) {
      requestAnimationFrame(() => {
        if (savedEssay) setEssay(savedEssay);
        if (savedTheme) setTheme(savedTheme);
        if (savedFont === 'kalam' || savedFont === 'sans') {
          setFontFamily(savedFont);
        }
      });
    }
    
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Save font family whenever it changes
  useEffect(() => {
    if (isInitialMount.current) return;
    localStorage.setItem('redator_font_family', fontFamily);
  }, [fontFamily]);

  // Debounced save for essay and theme
  useEffect(() => {
    if (isInitialMount.current) return;

    // Immediately set saving state when content changes
    setSaveStatus('saving');

    const debounceTimer = setTimeout(() => {
      localStorage.setItem('redator_draft', essay);
      localStorage.setItem('redator_theme', theme);
      setSaveStatus('saved');
    }, 800);

    return () => clearTimeout(debounceTimer);
  }, [essay, theme]);

  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length;
  const lineEstimate = Math.max(0, Math.ceil(essay.split('\n').length + (essay.length / 80)));

  return {
    essay,
    setEssay,
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    saveStatus,
    wordCount,
    lineEstimate
  };
}

