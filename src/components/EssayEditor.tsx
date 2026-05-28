import { useState } from 'react';
import { Camera, UploadCloud } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

interface EssayEditorProps {
  theme: string;
  setTheme: (theme: string) => void;
  essay: string;
  setEssay: (essay: string) => void;
  loading: boolean;
  transcribing: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  wordCount: number;
  lineEstimate: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fontFamily: 'kalam' | 'sans';
  setFontFamily: (font: 'kalam' | 'sans') => void;
  saveStatus: 'idle' | 'saving' | 'saved';
}

export const EssayEditor = ({
  theme, setTheme, essay, setEssay, loading, transcribing, 
  onImageUpload, onSubmit, wordCount, lineEstimate, fileInputRef,
  fontFamily, setFontFamily, saveStatus
}: EssayEditorProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onImageUpload(syntheticEvent);
    }
  };

  return (
    <div className="editor-container" id="editor">
      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label className="input-label" style={{ margin: 0 }}>Tema da Redação</label>
          <ThemeSelector onSelect={setTheme} currentTheme={theme} />
        </div>
        <input
          id="theme-input"
          type="text"
          className="theme-input"
          placeholder="Ex: Os desafios da educação inclusiva no Brasil..."
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          disabled={loading || transcribing}
        />
      </div>

      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
          <label className="input-label" style={{ margin: 0 }}>Seu Texto</label>
          <button 
            className="btn-secondary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={transcribing || loading}
          >
            <Camera size={16} />
            {transcribing ? 'Lendo imagem...' : 'Enviar foto da folha'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*" 
            onChange={onImageUpload}
          />
        </div>
        
        <div 
          className="notebook-card"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
        >
          {/* Drag and Drop Premium Glass Overlay */}
          <div 
            className={`drag-overlay ${isDragging ? 'active' : ''}`}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={handleDrop}
          >
            <div className="drag-overlay-box">
              <div className="drag-overlay-icon">
                <UploadCloud size={32} />
              </div>
              <h3 className="drag-overlay-title">Solte sua redação aqui</h3>
              <p className="drag-overlay-subtitle">
                Nossa Inteligência Artificial vai transcrever sua caligrafia automaticamente a partir da foto.
              </p>
            </div>
          </div>

          <div className="notebook-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }}></div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>
            </div>

            <div className="font-selector-container" style={{ margin: '0 auto 0 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>ESTILO:</span>
              <div className="font-selector">
                <button 
                  type="button"
                  className={`font-selector-btn ${fontFamily === 'kalam' ? 'active' : ''}`}
                  onClick={() => setFontFamily('kalam')}
                >
                  Manuscrito
                </button>
                <button 
                  type="button"
                  className={`font-selector-btn ${fontFamily === 'sans' ? 'active' : ''}`}
                  onClick={() => setFontFamily('sans')}
                >
                  Digitação
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.025em' }}>
              {transcribing ? 'IA ESTÁ TRANSCREVENDO...' : 'MODO ESCRITA ATIVO'}
            </div>
          </div>
          <div className="notebook-body">
            <div className="lines-container">
              <textarea
                className="essay-textarea"
                placeholder="Escreva sua redação ou envie uma foto para transcrever..."
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                disabled={loading || transcribing}
                style={{ fontFamily: fontFamily === 'kalam' ? 'var(--font-kalam), cursive' : 'var(--font-inter), sans-serif' }}
              />
            </div>
            {transcribing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                 <div className="spinner"></div>
              </div>
            )}
          </div>
          <div className="status-bar">
            <div>Palavras: <span>{wordCount}</span></div>
            <div>Linhas (est.): <span style={{ color: lineEstimate < 7 ? '#ef4444' : 'inherit' }}>{lineEstimate} / 30</span></div>

            <div className="led-container">
              <div className={`led-dot ${saveStatus === 'saving' ? 'saving' : 'saved'}`} />
              <span>{saveStatus === 'saving' ? 'Salvando...' : 'Salvo no navegador'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          className="btn-primary"
          onClick={onSubmit}
          disabled={loading || transcribing}
        >
          {loading ? 'Analisando...' : 'Finalizar e Corrigir'}
        </button>
      </div>
    </div>
  );
};
