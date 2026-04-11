import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Stricter rate limit for order/redeem endpoints (3 requests per minute)
export const strictRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/strict",
});

/**
 * Rate limit middleware for API routes
 * @param identifier - Unique identifier for the request (usually IP address)
 * @param strict - Whether to use strict rate limiting (for order/redeem endpoints)
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function rateLimitCheck(
  identifier: string,
  strict: boolean = false
) {
  const limiter = strict ? strictRatelimit : ratelimit;
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  
  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Get IP address from request headers
 * Supports Vercel, Cloudflare, and standard X-Forwarded-For
 */
export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnecting = request.headers.get("cf-connecting-ip");
  
  if (cfConnecting) return cfConnecting;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();
  
  return "unknown";
}
