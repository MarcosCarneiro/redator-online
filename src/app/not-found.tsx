import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(to bottom, #fcfdfe, #f8fafc)'
    }}>
      <div style={{ maxWidth: '500px' }}>
        <div style={{
          width: '120px',
          height: '120px',
          background: '#eff6ff',
          color: '#3b82f6',
          borderRadius: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2.5rem',
          boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1)'
        }}>
          <FileQuestion size={64} />
        </div>
        
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 800, 
          color: '#1e3a8a', 
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          404
        </h1>
        
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          color: '#0f172a', 
          marginBottom: '1.5rem' 
        }}>
          Página não encontrada
        </h2>
        
        <p style={{ 
          color: '#64748b', 
          fontSize: '1.1rem', 
          marginBottom: '3rem',
          lineHeight: 1.6
        }}>
          Ops! O conteúdo que você está procurando parece não existir ou foi movido para outro lugar.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link href="/" className="btn-primary" style={{ 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '1rem 2rem'
          }}>
            <Home size={20} />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
