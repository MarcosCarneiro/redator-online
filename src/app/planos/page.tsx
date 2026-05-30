import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Pricing } from '@/components/Pricing';
import { planRepository } from '@/db/repositories/plan.repository';

// Pre-render the page statically and revalidate cache at most once every hour
export const revalidate = 3600;

export default async function PlanosPage() {
  const publicPlans = await planRepository.getPublicPlansDirect();

  // Convert schema plan types to match component expected interfaces if needed
  const formattedPlans = publicPlans.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    essayLimit: plan.essayLimit
  }));

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>
        <Pricing initialPlans={formattedPlans} />
      </main>
      <Footer />
    </>
  );
}

