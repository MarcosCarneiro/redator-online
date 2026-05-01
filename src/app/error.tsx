'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(to bottom, #fcfdfe, #fff5f5)'
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
          margin: '0 auto 2.5rem',
          boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1)'
        }}>
          <AlertTriangle size={56} />
        </div>
        
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 800, 
          color: '#991b1b', 
          marginBottom: '1rem' 
        }}>
          Ocorreu um erro inesperado
        </h1>
        
        <p style={{ 
          color: '#64748b', 
          fontSize: '1.1rem', 
          marginBottom: '3rem',
          lineHeight: 1.6
        }}>
          Pedimos desculpas pelo transtorno. Nossa equipe foi notificada e estamos trabalhando para resolver o problema o mais rápido possível.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            className="btn-primary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '1rem 2rem'
            }}
          >
            <RefreshCcw size={20} />
            Tentar Novamente
          </button>
          
          <Link href="/" className="btn-secondary" style={{ 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '1rem 2rem'
          }}>
            <Home size={20} />
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
