import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import redis from "@/lib/redis";
import { getClientIp } from "@/lib/ip";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Rate Limiting for API routes
    if (pathname.startsWith('/api') && pathname !== '/api/webhook/stripe') {
        const ip = getClientIp(request);
        
        const { success, limit, reset, remaining } = await ratelimit.limit(
          `ratelimit:global:${ip}`
        );

        if (!success) {
            return NextResponse.json(
                { error: "Muitas requisições. Por favor, aguarde um pouco antes de tentar novamente." },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                    }
                }
            );
        }
    }

    // 2. Auth Protection Logic
    const isPublicRoute = 
        pathname === "/" || 
        pathname === "/api/transcribe" || 
        pathname === "/api/evaluate" || 
        pathname.startsWith("/api/auth") ||
        pathname === "/api/webhook/stripe" ||
        pathname === "/planos" ||
        pathname.startsWith("/history/") || // Detailed essays are server-side checked
        pathname === "/favicon.ico" ||
        pathname === "/globals.css";

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Optimistic check: existence of session cookie
    const cookies = request.cookies.getAll();
    const hasSessionCookie = cookies.some(c => 
        c.name.includes("session-token") || 
        c.name.includes("better-auth")
    );

    if (!hasSessionCookie) {
        // Only redirect for page requests, not for internal API calls that might fail auth check
        if (!pathname.startsWith('/api')) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
