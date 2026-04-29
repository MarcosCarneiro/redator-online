import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define public routes
    const isPublicRoute = 
        pathname === "/" || 
        pathname === "/api/transcribe" || 
        pathname === "/api/evaluate" || 
        pathname.startsWith("/api/auth") ||
        pathname === "/api/webhook/mercadopago";

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Optimistic check: existence of session cookie
    const cookies = request.cookies.getAll();
    const hasSessionCookie = cookies.some(c => c.name.includes("session-token") || c.name.includes("better-auth"));

    if (!hasSessionCookie) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes except public ones
        '/(api|trpc)(.*)',
    ],
};
