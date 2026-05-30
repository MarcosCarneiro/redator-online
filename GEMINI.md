# Redator Online - Project Context

This document provides foundational context and instructions for the Redator Online project, an AI-powered essay evaluation platform focused on the Brazilian ENEM exam.

## Project Overview

Redator Online is a web application that allows users to submit essays for automated evaluation using AI. It provides detailed feedback based on the five official ENEM competencies.

### Core Technology Stack
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Icons:** Lucide React
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Drizzle ORM
- **Authentication:** better-auth (with Google Social Provider)
- **AI:** OpenAI (GPT-4o-mini with Vision capability for image transcription)
- **Payments:** Stripe (Subscriptions and Recurring Payments)
- **Validation:** Zod

## Building and Running

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL database (e.g., Neon)
- Stripe Developer Account
- Upstash Redis Database
- OpenAI API Key

### Environment Setup
Create a `.env.local` file with the following variables:
```env
# Database (Neon PostgreSQL)
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=

# Auth (better-auth)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI (OpenAI API)
OPENAI_API_KEY=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Rate Limiting & Caching (Upstash Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Key Commands
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run db:push`: Pushes schema changes to the database (Drizzle Kit).
- `npm run db:studio`: Opens Drizzle Studio to explore the database.

## Architecture and Key Files

### Database (`src/db/`)
- `schema.ts`: Defines the PostgreSQL schema using Drizzle ORM. Key tables include `user`, `plans`, `essays`, and `webhook_logs`.
- `index.ts`: Database connection initialization.

### Authentication (`src/lib/auth.ts`)
Configured using `better-auth` with a Drizzle adapter. Supports Google login.

### API Routes (`src/app/api/`)
- `evaluate/route.ts`: Core logic for essay evaluation. It validates the submission, enforces mandatory authentication (guests/non-logged users are not allowed to submit, preventing API abuse), checks and decrements user limits (free tier gets 3 credits upon registration), calls OpenAI with a calibrated ENEM rubric prompt, and saves the results in PostgreSQL.
- `transcribe/route.ts`: Transcribes handwritten essays from images using OpenAI GPT-4o-mini's Vision API. Protects against anonymous abuse by requiring authentication, and enforces plan limits.
- `checkout/route.ts`: Creates Stripe Checkout Sessions for plan subscriptions.
- `billing/portal/route.ts`: Creates Stripe Customer Portal sessions so users can self-manage their subscriptions (cancel, update payment methods, etc.).
- `webhook/stripe/route.ts`: Listens to Stripe webhook events (checkout success, invoice payments, cancellations) to update user plan and subscription status in the PostgreSQL database.
- `user/usage/route.ts`: Provides active essay usage, transcription limits, and plan details for the logged-in user.

### Components (`src/components/`)
- `EssayEditor.tsx`: The main interface for inputting and submitting essays.
- `EvaluationResults.tsx`: Displays the AI-generated feedback and scores.
- `BentoGrid.tsx`: Likely used for the homepage feature showcase.

## Development Conventions

1.  **Type Safety:** Always use TypeScript and define interfaces for data structures.
2.  **Validation:** Use `Zod` for validating API request bodies and AI responses.
3.  **Database Operations:** Use Drizzle ORM's fluent API for all database interactions.
4.  **Error Handling:** Implement robust error handling in API routes, specifically for AI hallucinations or third-party service failures.
5.  **Environment Variables:** Never hardcode secrets. Always use `process.env`.
6.  **AI Prompts:** The evaluation prompt in `src/app/api/evaluate/route.ts` is highly calibrated for ENEM rules. Modify with extreme caution.
7.  **Payment Lifecycle:** Subscription states are mapped from Stripe events (active, past_due, canceled) to the `user` table's `subscriptionStatus` and `planId` fields. The system leverages the Stripe Customer Portal for self-service subscription management.
8.  **Anonymous Access Policy:** All major AI actions (Essay Evaluation and OCR Transcription) strictly require an authenticated session (`better-auth`). Unauthenticated requests are rejected with a `401 Unauthorized` status to prevent heavy API consumption and resource abuse. Upon registering, users are automatically placed on a 'free' tier with 3 essay credits.
9.  **Rate Limiting:** Heavy operations (essay evaluations and transcribing) are rate-limited via Upstash Redis/KV using the user's ID to prevent high load and prompt injection/abuse.
10. **Testing Conventions:**
    - **Unit Tests:** Colocate unit test files alongside the code they test (e.g., `src/lib/sync-subscription.test.ts` next to `src/lib/sync-subscription.ts`).
    - **End-to-End (E2E) Tests:** Place E2E tests in the dedicated `e2e/` directory (e.g., `e2e/basic.spec.ts`), as they typically test user flows across multiple components.

## UI/UX Guidelines
- Maintain a clean, professional aesthetic suitable for an educational platform.
- Ensure responsive design using Tailwind CSS.
- Provide clear feedback to the user during long-running AI evaluations (see `AnalysisLoading.tsx`).

