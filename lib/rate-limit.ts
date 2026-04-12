import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitMode = 'redis' | 'memory' | 'disabled';
type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

/**
 * In-memory rate limiter fallback (when Redis not available)
 * Uses Map with sliding window algorithm
 */
class MemoryRateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();
  private maxRequests: number;
  private windowMs: number;
  private readonly MAX_ENTRIES = 10000; // ✅ FIX 2: Cap map size to prevent memory leaks

  constructor(limit: number, windowMs: number) {
    this.maxRequests = limit;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    
    // ✅ FIX 2: Always cleanup (not probabilistic)
    this.cleanup(now);
    
    // ✅ FIX 2: Enforce hard limit on map size
    if (this.requests.size >= this.MAX_ENTRIES) {
      const firstKey = this.requests.keys().next().value;
      if (firstKey) {
        this.requests.delete(firstKey);
      }
    }
    
    const entry = this.requests.get(identifier);
    
    if (!entry || now >= entry.resetAt) {
      // First request or window expired
      const resetAt = now + this.windowMs;
      this.requests.set(identifier, { count: 1, resetAt });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: Math.floor(resetAt / 1000),
      };
    }
    
    // Within existing window
    if (entry.count < this.maxRequests) {
      entry.count++;
      this.requests.set(identifier, entry);
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - entry.count,
        reset: Math.floor(entry.resetAt / 1000),
      };
    }
    
    // Rate limit exceeded
    return {
      success: false,
      limit: this.maxRequests,
      remaining: 0,
      reset: Math.floor(entry.resetAt / 1000),
    };
  }
  
  private cleanup(now: number) {
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetAt) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Detect which rate limiting mode to use
 */
function detectMode(): RateLimitMode {
  // Check if Redis is configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return 'redis';
  }
  
  // ✅ FIX 3: Don't use broken in-memory in production (serverless = separate memory per instance)
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Redis not configured - rate limiting DISABLED in production');
    return 'disabled'; // NOT 'memory'
  }
  
  // Safe default for development
  return 'disabled';
}

const mode = detectMode();

// Initialize rate limiters based on mode
let ratelimit: Ratelimit | MemoryRateLimiter | null = null;
let strictRatelimit: Ratelimit | MemoryRateLimiter | null = null;

if (mode === 'redis') {
  try {
    const redis = Redis.fromEnv();
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
    
    strictRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/strict",
    });
    
    console.log('✅ Redis rate limiting initialized');
  } catch (error) {
    console.error('❌ Redis initialization failed:', error);
    // Fall back to memory mode
    ratelimit = new MemoryRateLimiter(10, 10000); // 10 req / 10s
    strictRatelimit = new MemoryRateLimiter(3, 60000); // 3 req / 1m
    console.warn('⚠️ Falling back to in-memory rate limiting');
  }
} else if (mode === 'memory') {
  ratelimit = new MemoryRateLimiter(10, 10000); // 10 req / 10s
  strictRatelimit = new MemoryRateLimiter(3, 60000); // 3 req / 1m
  console.log('✅ In-memory rate limiting initialized');
}

/**
 * Rate limit middleware for API routes
 * @param identifier - Unique identifier for the request (usually IP address)
 * @param strict - Whether to use strict rate limiting (for order/redeem endpoints)
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function rateLimitCheck(
  identifier: string,
  strict: boolean = false
): Promise<RateLimitResult> {
  // If rate limiting is disabled (dev mode)
  if (!ratelimit || !strictRatelimit) {
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Math.floor(Date.now() / 1000) + 60,
    };
  }
  
  try {
    const limiter = strict ? strictRatelimit : ratelimit;
    const result = await limiter.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // If rate limiting fails, allow the request through
    console.error('Rate limit check failed:', error);
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Math.floor(Date.now() / 1000) + 60,
    };
  }
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
  
  // ✅ FIX 1: Use LAST IP (added by Vercel), not first (client can spoof)
  if (forwarded) {
    const ips = forwarded.split(",").map(ip => ip.trim());
    return ips[ips.length - 1] || "unknown";
  }
  
  return "unknown";
}
