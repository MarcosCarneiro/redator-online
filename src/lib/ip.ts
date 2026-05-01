import { type NextRequest } from 'next/server';

/**
 * Robustly extracts the client's IP address from request headers.
 * Supports both standard Request (API routes) and NextRequest (Middleware).
 */
export function getClientIp(req: Request | NextRequest): string {
  // Security: Better IP detection (less spoofable than x-forwarded-for alone)
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  return '127.0.0.1';
}
