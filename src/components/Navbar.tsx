'use client';

import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";

export const Navbar = () => (
  <nav className="navbar">
    <div className="nav-content">
      <a href="/" className="logo">
        <div className="logo-dot"></div>
        Redator<span>Online</span>
      </a>
      <div className="nav-links">
        <a>Metodologia</a>
        <a>Temas</a>
        <a>Planos</a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
              Entrar
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </div>
  </nav>
);
