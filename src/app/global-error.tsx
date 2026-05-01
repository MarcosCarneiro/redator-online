'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#fcfdfe',
        color: '#0f172a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: '#fef2f2',
            color: '#ef4444',
            borderRadius: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2.5rem'
          }}>
            <AlertTriangle size={56} />
          </div>
          
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#991b1b', marginBottom: '1rem' }}>
            Erro Crítico no Sistema
          </h1>
          
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: 1.6 }}>
            Houve um erro grave ao carregar a plataforma. Por favor, tente recarregar a página.
          </p>
          
          <button
            onClick={() => reset()}
            style={{
              background: '#1e3a8a',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '1.1rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCcw size={20} />
            Recarregar Aplicação
          </button>
        </div>
      </body>
    </html>
  );
}
