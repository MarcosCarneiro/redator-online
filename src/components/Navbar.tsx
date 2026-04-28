'use client';

import { authClient } from "@/lib/auth-client";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

export const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();

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
          <Link href="/#metodologia">Metodologia</Link>
          <Link href="/#temas">Temas</Link>
          <Link href="/#planos">Planos</Link>
          {session && (
            <Link href="/history">Meu Histórico</Link>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
    </nav>
  );
};
