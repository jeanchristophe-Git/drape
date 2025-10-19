import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Créer un rate limiter avec Upstash Redis si configuré
// Sinon utiliser un fallback en mémoire (pour dev)
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '30 s'), // 1 requête par 30 secondes
    analytics: true,
  });
}

// Fallback simple en mémoire pour dev (non-production)
const memoryCache = new Map<string, number>();

export async function rateLimit(
  identifier: string,
  options?: { interval?: number; uniqueTokenPerInterval?: number }
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // Si Upstash est configuré, l'utiliser
  if (ratelimit) {
    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  // Sinon utiliser le fallback en mémoire
  const interval = options?.interval || 30000; // 30 secondes par défaut
  const now = Date.now();
  const lastRequest = memoryCache.get(identifier);

  if (lastRequest && now - lastRequest < interval) {
    return {
      success: false,
      remaining: 0,
    };
  }

  memoryCache.set(identifier, now);

  // Nettoyer le cache toutes les 5 minutes
  setTimeout(() => {
    memoryCache.delete(identifier);
  }, interval * 10);

  return {
    success: true,
    remaining: 1,
  };
}
