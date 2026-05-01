# Production Readiness Plan: Redator Online

Based on the current state of the codebase, the following critical areas must be addressed before the application can be considered stable, secure, and ready for production traffic.

## 1. Fix Build Blockers (Type Safety & Linting)
Next.js will block a production build (`npm run build`) if there are unresolved TypeScript or ESLint errors. The project currently has numerous errors.
*   **Resolve `any` Types:** Many API routes (`evaluate`, `checkout`, `transcribe`, `stripe/route.ts`) rely heavily on `any` types. Strongly type these using the existing Zod schemas or Drizzle models.
*   **Fix React Hook Violations:** 
    *   `src/app/page.tsx`: Synchronous `setState` calls inside a `useEffect` are causing cascading renders.
    *   `src/components/Pricing.tsx`: Attempting to mutate `window.location.href` directly inside a React component logic flow.
*   **Optimize Next.js Images:** `src/components/Navbar.tsx` is using standard HTML `<img>` tags. Switch to the Next.js `<Image />` component for automatic WebP conversion, lazy loading, and caching.

## 2. Error Handling & Resilience (Missing Boundaries)
The project currently lacks Next.js Error Boundaries, leading to poor user experiences during failures.
*   **Implement `error.tsx`:** If an API call fails or a React component throws an exception, the application crashes with an unstyled default page. Create `error.tsx` and `global-error.tsx` files to catch these gracefully and offer a recovery option (e.g., a "Try Again" button).
*   **Implement `not-found.tsx`:** A custom 404 page is standard for a professional SaaS and must be added.

## 3. Security Hardening
*   **Global Rate Limiting:** While guest rate limiting exists on the evaluate route, the application is vulnerable to brute-force attacks on other endpoints (e.g., `/api/transcribe` or Better-Auth endpoints). Implement a global rate-limiter using the Upstash Redis setup for all API routes.
*   **Environment Variable Validation:** Ensure the app fails to start if critical variables (like `MERCADO_PAGO_ACCESS_TOKEN` or `OPENAI_API_KEY`) are missing. Use a library like `@t3-oss/env-nextjs` or a Zod schema to validate them on boot.

## 4. Observability & Logging
*   **Centralized Error Tracking:** The app relies on `console.error` and `console.warn`, which are easily lost in production. Integrate an observability tool (like **Sentry**) to track unhandled exceptions and AI hallucinations in real-time.
*   **User Analytics:** Integrate a tool like Vercel Analytics or PostHog to track the user journey and identify drop-off points (e.g., on the pricing page or submission form).

## 5. Automated Testing
The project currently has zero testing libraries configured. Before processing real transactions, implement:
*   **Unit Tests:** For core logic, such as subscription synchronization (`src/lib/sync-subscription.ts`), evaluation validation, and the Redis cache utility.
*   **End-to-End (E2E) Tests:** Use Playwright or Cypress to automate the critical paths (e.g., Login -> Write Essay -> Get Evaluation -> Hit Plan Limit -> Upgrade Plan).