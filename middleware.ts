import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

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
  // Get IP from headers
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  
  let success, limit, remaining, reset;

  // Check if this is a link preview request
  const isLinkPreviewRequest = request.nextUrl.pathname.startsWith('/api/') && 
                               request.nextUrl.pathname.includes('link-preview/fetch');

  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    ({ success, limit, remaining, reset } = await getRateLimiter.limit(ip));
  } else if (isLinkPreviewRequest) {
    // Use more lenient rate limiter for link preview
    ({ success, limit, remaining, reset } = await linkPreviewRateLimiter.limit(ip));
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
  
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
