import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define as rotas que podem ser acessadas sem login
const isPublicRoute = createRouteMatcher([
  '/', 
  '/api/transcribe', // Mantendo aberto por enquanto para teste
  '/api/evaluate'    // Mantendo aberto por enquanto para teste
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Pula arquivos internos do Next.js e arquivos estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Sempre roda para rotas de API
    '/(api|trpc)(.*)',
  ],
};
