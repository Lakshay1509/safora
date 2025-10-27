import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Lenient limiter for GET requests
const getRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(300, '15m'), 
  analytics: true,
  prefix: '@upstash/ratelimit-get',
});

// Stricter limiter for mutations
const mutationRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '15m'), 
  analytics: true,
  prefix: '@upstash/ratelimit-mutation',
});

// More lenient limiter for link preview
const linkPreviewRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(300, '15m'), 
  analytics: true,
  prefix: '@upstash/ratelimit-link-preview',
});


export async function middleware(request: NextRequest) {
  // Skip middleware during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next()
  }
  
  const pathname = request.nextUrl.pathname;
  
  // Only apply rate limiting to /api routes
  if (pathname.startsWith('/api/')) {
    // Get IP from headers
    const ip = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'
    
    let success, limit, remaining, reset;

    // Check if this is a link preview request
    const isLinkPreviewRequest = pathname.includes('link-preview/fetch');

    if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
      if (isLinkPreviewRequest) {
        // Use more lenient rate limiter for link preview
        ({ success, limit, remaining, reset } = await linkPreviewRateLimiter.limit(ip));
      } else {
        ({ success, limit, remaining, reset } = await getRateLimiter.limit(ip));
      }
    } else {
      ({ success, limit, remaining, reset } = await mutationRateLimiter.limit(ip));
    }
    
    // Block request if rate limit exceeded
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      )
    }
  }
  
  // Continue with session update for all routes
  return await updateSession(request)
}
