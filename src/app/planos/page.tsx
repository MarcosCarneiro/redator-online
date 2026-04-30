import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Pricing } from '@/components/Pricing';

export default function PlanosPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
