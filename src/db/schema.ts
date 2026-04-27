import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  externalId: text('external_id').unique().notNull(), // Clerk/Auth ID
  email: text('email').notNull(),
  planStatus: text('plan_status').default('free'), // free, pro, active, etc.
  customerId: text('customer_id'), // Generic payment provider customer ID
  subscriptionId: text('subscription_id'), // Generic subscription reference
  createdAt: timestamp('created_at').defaultNow(),
});

export const essays = pgTable('essays', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  userIp: text('user_ip'), // Adicionado para controle de guests
  theme: text('theme').notNull(),
  content: text('content').notNull(),
  totalScore: integer('total_score'),
  evaluation: jsonb('evaluation'), // Full AI response object
  createdAt: timestamp('created_at').defaultNow(),
});
