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
- **AI:** OpenAI (GPT-4o-mini)
- **Payments:** Mercado Pago (Subscriptions and Recurring Payments)
- **Validation:** Zod

## Building and Running

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL database (e.g., Neon)
- Mercado Pago Developer Account
- OpenAI API Key

### Environment Setup
Create a `.env.local` file with the following variables:
```env
# Database
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
OPENAI_API_KEY=

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
- `evaluate/route.ts`: The core logic for essay evaluation. It validates the submission, checks user limits (3 free for guests, plan-based for users), calls OpenAI with a specialized ENEM prompt, and saves the results.
- `webhook/stripe/route.ts`: Handles payment and subscription status updates from Stripe. Includes signature verification and external reference mapping to user IDs.
- `user/usage/route.ts`: Provides current essay usage and plan limits for the logged-in user.

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
7.  **Payment Lifecycle:** Subscription states are mapped from Mercado Pago (`authorized`, `paused`, `cancelled`) to the `user` table's `subscriptionStatus` field.
8.  **Testing Conventions:**
    - **Unit Tests:** Colocate unit test files alongside the code they test (e.g., `src/lib/sync-subscription.test.ts` next to `src/lib/sync-subscription.ts`).
    - **End-to-End (E2E) Tests:** Place E2E tests in the dedicated `e2e/` directory (e.g., `e2e/basic.spec.ts`), as they typically test user flows across multiple components.

## UI/UX Guidelines
- Maintain a clean, professional aesthetic suitable for an educational platform.
- Ensure responsive design using Tailwind CSS.
- Provide clear feedback to the user during long-running AI evaluations (see `AnalysisLoading.tsx`).

