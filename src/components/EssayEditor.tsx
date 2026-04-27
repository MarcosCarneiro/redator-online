import { Camera } from 'lucide-react';

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
}

export const EssayEditor = ({
  theme, setTheme, essay, setEssay, loading, transcribing, 
  onImageUpload, onSubmit, wordCount, lineEstimate, fileInputRef
}: EssayEditorProps) => {
  return (
    <div className="editor-container" id="editor">
      <div className="input-group">
        <label className="input-label">Tema da Redação</label>
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
        
        <div className="notebook-card">
          <div className="notebook-header">
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }}></div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
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
            <div style={{ marginLeft: 'auto', opacity: 0.6 }}>Autosave on</div>
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
