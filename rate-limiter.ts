// lib/rate-limiter.ts
import { LRUCache } from 'lru-cache';

const rateLimiters = new Map<string, LRUCache<string, number>>();

export function rateLimit(options: {
  uniqueTokenPerInterval?: number;
  interval?: number;
  limit: number;
}) {
  const tokenCache = new LRUCache<string, number>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (token: string) => {
      const tokenCount = tokenCache.get(token) || 0;
      if (tokenCount >= options.limit) {
        return { success: false };
      }
      tokenCache.set(token, tokenCount + 1);
      return { success: true, remaining: options.limit - tokenCount - 1 };
    },
  };
}
