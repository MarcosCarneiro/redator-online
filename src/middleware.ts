import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

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
