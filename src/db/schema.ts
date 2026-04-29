import { pgTable, text, timestamp, boolean, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

export const plans = pgTable("plans", {
    id: text("id").primaryKey(), // e.g., 'pro_10', 'pro_100'
    name: text("name").notNull(),
    price: integer("price").notNull(), // in cents
    essayLimit: integer("essay_limit").notNull(),
    mercadopagoPlanId: text("mercadopago_plan_id"), // ID from MP Dashboard
    description: text("description"),
});

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
    // Subscription fields
    planId: text('plan_id').references(() => plans.id),
    essaysUsed: integer('essays_used').default(0),
    subscriptionStatus: text('subscription_status').default('none'), // none, active, past_due, canceled
    subscriptionId: text('subscription_id'),
    subscriptionExpiresAt: timestamp('subscription_expires_at'),
    // Legacy/Generic fields
    customerId: text('customer_id'),
    subscriptionReference: text('subscription_reference'),
});

export const essays = pgTable('essays', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id),
  userIp: text('user_ip'),
  theme: text('theme').notNull(),
  content: text('content').notNull(),
  totalScore: integer('total_score'),
  evaluation: jsonb('evaluation'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userRelations = relations(user, ({ one, many }) => ({
    plan: one(plans, {
        fields: [user.planId],
        references: [plans.id],
    }),
    essays: many(essays),
}));

export const plansRelations = relations(plans, ({ many }) => ({
    users: many(user),
}));

export const essaysRelations = relations(essays, ({ one }) => ({
    user: one(user, {
        fields: [essays.userId],
        references: [user.id],
    }),
}));

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt"),
});

export const webhookLogs = pgTable("webhook_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(), // 'mercadopago'
    type: text("type"), // 'payment', 'subscription_preapproval', etc.
    source: text("source").default('webhook'), // 'webhook', 'sync'
    userId: text("user_id"), // The user associated with this event
    resourceId: text("resource_id"),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at").defaultNow(),
    status: text("status").default('received'), // received, processed, error
    errorMessage: text("error_message"),
});
