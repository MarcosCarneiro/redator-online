'use client';

import { useState } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { SUGGESTED_THEMES, Theme } from '@/data/themes';

interface ThemeSelectorProps {
  onSelect: (theme: string) => void;
  currentTheme: string;
}

export const ThemeSelector = ({ onSelect, currentTheme }: ThemeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (themeTitle: string) => {
    onSelect(themeTitle);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector-wrapper">
      <button 
        className="btn-suggestion" 
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Sparkles size={16} />
        Ver Sugestões de Temas
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="icon-circle">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>Sugestões de Temas</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Selecione um tema para praticar sua redação</p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="themes-grid">
              {SUGGESTED_THEMES.map((theme) => (
                <div 
                  key={theme.id} 
                  className={`theme-card ${currentTheme === theme.title ? 'active' : ''}`}
                  onClick={() => handleSelect(theme.title)}
                >
                  <div className="theme-category">{theme.category}</div>
                  <h3 className="theme-title">{theme.title}</h3>
                  {theme.description && <p className="theme-desc">{theme.description}</p>}
                  <div className="theme-action">
                    <span>Usar este tema</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="modal-footer">
              <p>Dica: Temas baseados nas principais apostas para o ENEM.</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .theme-selector-wrapper {
          display: inline-block;
          margin-top: 0.5rem;
        }

        .btn-suggestion {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f0f9ff;
          color: var(--primary-light);
          border: 1px dashed var(--primary-light);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-suggestion:hover {
          background: #e0f2fe;
          transform: translateY(-1px);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .modal-content {
          background: white;
          width: 100%;
          max-width: 800px;
          max-height: 85vh;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalAppear 0.3s ease-out;
        }

        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .icon-circle {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-close {
          background: #f8fafc;
          border: none;
          color: var(--text-light);
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close:hover { background: #f1f5f9; color: var(--text-dark); }

        .themes-grid {
          padding: 1.5rem 2rem;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        @media (max-width: 640px) {
          .themes-grid { grid-template-columns: 1fr; }
        }

        .theme-card {
          padding: 1.5rem;
          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }

        .theme-card:hover {
          background: white;
          border-color: var(--primary-light);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }

        .theme-card.active {
          border-color: var(--primary);
          background: #eff6ff;
        }

        .theme-category {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--primary-light);
          margin-bottom: 0.5rem;
        }

        .theme-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-dark);
          line-height: 1.4;
          margin-bottom: 0.75rem;
        }

        .theme-desc {
          font-size: 0.85rem;
          color: var(--text-light);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 1.25rem;
        }

        .theme-action {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .theme-card:hover .theme-action { opacity: 1; }

        .modal-footer {
          padding: 1rem 2rem;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          border-radius: 0 0 24px 24px;
        }

        .modal-footer p {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-light);
          text-align: center;
        }
      `}</style>
    </div>
  );
};
