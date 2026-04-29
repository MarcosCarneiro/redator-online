import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { syncUserSubscription } from '@/lib/sync-subscription';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CheckCircle2, ArrowRight, History } from 'lucide-react';
import Link from 'next/link';

export default async function SuccessPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/');
  }

  // Actively sync subscription status with Mercado Pago on the success page
  await syncUserSubscription(session.user.id);

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '8rem 2rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '600px', textAlign: 'center', background: '#fff', padding: '4rem', borderRadius: '48px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
          <div style={{ display: 'inline-flex', padding: '1.5rem', background: '#ecfdf5', borderRadius: '50%', marginBottom: '2rem' }}>
            <CheckCircle2 size={64} color="#10b981" />
          </div>
          
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Pagamento Confirmado!
          </h1>
          
          <p style={{ color: 'var(--text-light)', fontSize: '1.25rem', marginBottom: '3rem', lineHeight: 1.6 }}>
            Sua assinatura foi processada com sucesso. Seus créditos de redação já foram atualizados e você está pronto para começar!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.1rem', padding: '1.25rem 2.5rem' }}>
              Escrever minha primeira redação
              <ArrowRight size={20} />
            </Link>
            
            <Link href="/history" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-light)', textDecoration: 'none', fontWeight: 600, padding: '1rem' }}>
              <History size={18} />
              Ver meu histórico
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
