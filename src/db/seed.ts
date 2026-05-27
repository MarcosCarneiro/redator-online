import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

// Load environment variables from .env.local BEFORE importing database or redis
dotenv.config({
  path: '.env.local',
});

const defaultPlans = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    essayLimit: 3,
    stripePriceId: null,
    description: 'Plano Gratuito com 3 redações grátis',
  },
  {
    id: 'pro_2',
    name: 'Plano Essencial',
    price: 490,
    essayLimit: 2,
    stripePriceId: 'price_pro_2_temp', // Temporary Stripe price ID
    description: 'Essencial - 2 Correções de Redações por mês',
  },
  {
    id: 'pro_4',
    name: 'Plano Semanal',
    price: 790,
    essayLimit: 4,
    stripePriceId: 'price_pro_4_temp', // Temporary Stripe price ID
    description: 'Semanal - 4 Correções de Redações por mês',
  },
  {
    id: 'pro_8',
    name: 'Plano Intensivo',
    price: 1290,
    essayLimit: 8,
    stripePriceId: 'price_pro_8_temp', // Temporary Stripe price ID
    description: 'Intensivo - 8 Correções de Redações por mês',
  }
];

async function main() {
  // Dynamically import db modules to ensure process.env variables are already loaded
  const { db } = await import('@/db');
  const { plans: plansTable } = await import('@/db/schema');
  const { redis } = await import('@/lib/redis');

  console.log('🚀 Seeding plans into the database...');
  
  for (const plan of defaultPlans) {
    console.log(`Upserting plan: ${plan.id} (${plan.name})...`);
    
    // Check if the plan already exists in the database
    const existing = await db.query.plans.findFirst({
      where: eq(plansTable.id, plan.id)
    });
    
    if (existing) {
      // Update properties, keeping their existing stripePriceId if it is already configured (not a temp one)
      const finalPriceId = (existing.stripePriceId && !existing.stripePriceId.includes('_temp')) 
        ? existing.stripePriceId 
        : plan.stripePriceId;

      await db.update(plansTable)
        .set({
          name: plan.name,
          price: plan.price,
          essayLimit: plan.essayLimit,
          description: plan.description,
          stripePriceId: finalPriceId,
        })
        .where(eq(plansTable.id, plan.id));
      console.log(`✅ Plan ${plan.id} updated.`);
    } else {
      // Insert new plan
      await db.insert(plansTable).values(plan);
      console.log(`✨ Plan ${plan.id} inserted.`);
    }
  }

  // Clear Redis caching layer for plans
  console.log('🧹 Cleaning Redis plan caches...');
  try {
    await redis.del('plans:public');
    await redis.del('plan:id:free');
    await redis.del('plan:id:pro_2');
    await redis.del('plan:id:pro_4');
    await redis.del('plan:id:pro_8');
    console.log('⚡ Redis plan caches successfully cleared!');
  } catch (err) {
    console.warn('⚠️ Could not clear Redis cache (maybe Redis is not running or credentials are not set):', err);
  }

  console.log('🎉 Database seeding completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error seeding database:', err);
  process.exit(1);
});
