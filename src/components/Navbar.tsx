'use client';

import { authClient } from "@/lib/auth-client";
import { LogOut, User as UserIcon, CreditCard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  const [usage, setUsage] = useState<{ essaysUsed: number; essayLimit: number; planName: string } | null>(null);

  useEffect(() => {
    if (session) {
      fetch('/api/user/usage')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setUsage(data);
        })
        .catch(console.error);
    }
  }, [session]);

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link href="/" className="logo">
          <div className="logo-dot"></div>
          Redator<span>Online</span>
        </Link>
        <div className="nav-links">
          <Link href="/planos">Planos</Link>
          {session && (
            <>
              <Link href="/history">Meu Histórico</Link>
              <Link href="/billing">Assinatura</Link>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {session && usage && (
            <div className="usage-badge">
              <CreditCard size={14} />
              <span>{usage.essaysUsed}/{usage.essayLimit} <small>redações</small></span>
            </div>
          )}

          {!session && !isPending && (
            <button 
              className="btn-secondary" 
              style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
              onClick={handleSignIn}
            >
              Entrar com Google
            </button>
          )}
          
          {session && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '100px', border: '1px solid #f1f5f9' }}>
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name} 
                    style={{ width: 24, height: 24, borderRadius: '50%' }} 
                  />
                ) : (
                  <UserIcon size={16} />
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                  {session.user.name?.split(' ')[0]}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-light)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem'
                }}
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .usage-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f0f9ff;
          color: var(--primary);
          padding: 0.4rem 0.8rem;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid #bae6fd;
        }
        .usage-badge small { font-weight: 400; opacity: 0.8; }
      `}</style>
    </nav>
  );
};
