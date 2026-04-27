import { FileText, Type } from 'lucide-react';

interface EssayPreviewProps {
  theme: string;
  content: string;
}

export const EssayPreview = ({ theme, content }: EssayPreviewProps) => {
  return (
    <div className="results-section no-print" style={{ marginBottom: '2rem', padding: '3rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1rem' }}>
          <Type size={20} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Conteúdo da Redação
          </span>
        </div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', lineHeight: 1.3 }}>
          {theme}
        </h2>
      </header>

      <div style={{ 
        background: '#f8fafc', 
        padding: '2rem', 
        borderRadius: '16px', 
        border: '1px solid #f1f5f9',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '1rem', 
          right: '1.5rem', 
          color: '#cbd5e1' 
        }}>
          <FileText size={40} strokeWidth={1} />
        </div>
        <p style={{ 
          color: 'var(--text-dark)', 
          lineHeight: 1.8, 
          whiteSpace: 'pre-wrap', 
          fontSize: '1.1rem',
          position: 'relative',
          zIndex: 1
        }}>
          {content}
        </p>
      </div>
    </div>
  );
};
