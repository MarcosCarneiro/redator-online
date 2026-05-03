# Redator Online - Improvement Plan

This document outlines the key areas for improvement identified during the project review.

## 1. Architecture & Centralization
*   **Centralize Quota/Subscription Logic:** Move quota checks and subscription limits from individual API routes (`/api/evaluate`, `/api/transcribe`) into a shared `QuotaService`.
*   **Decouple Plan Logic:** Remove hardcoded Stripe Plan IDs from the code. Use database-driven features (e.g., `canTranscribe` flag in the `plans` table) to manage capabilities.

## 2. Type Safety & Code Quality
*   **Eliminate `any` Types:** Replace all occurrences of `any` in API routes, repositories, and webhooks with strict Zod schemas and Drizzle types.
*   **Refactor `page.tsx`:** Break down the monolithic `src/app/page.tsx` client component into smaller, reusable components and custom hooks for state and persistence.

## 3. Documentation & Configuration
*   **Update Documentation:** Correct `GEMINI.md` to reflect that **Stripe** is the payment provider, not Mercado Pago.
*   **Fix Stripe API Version:** Update the invalid API version in `src/lib/stripe.ts` (currently `'2026-04-22.dahlia'`) to a valid stable version (e.g., `'2024-04-10'`).

## 4. UI/UX & Styling
*   **Leverage Tailwind CSS:** Migrate custom CSS and global variables from `globals.css` to Tailwind utility classes or theme configuration.
*   **Add Error Boundaries:** Implement `error.tsx` and `not-found.tsx` to handle runtime failures and 404s gracefully.

## 5. Security & Testing
*   **Robust Guest Tracking:** Complement IP-based rate limiting with browser fingerprinting or local storage tokens.
*   **Automated Test Coverage:** Prioritize unit tests for `QuotaService` and `sync-subscription.ts`, and E2E tests for the checkout and evaluation flows.
