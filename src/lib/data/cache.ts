import { cache } from 'react'

// Long-lived in-memory cache with TTL
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

const ONE_HOUR_MS = 60 * 60 * 1000

/**
 * Creates a cached fetcher with both:
 * 1. Long-lived memory cache (1 hour TTL) - persists across requests
 * 2. React's cache() - per-request deduplication for concurrent calls
 */
export function createCachedFetcher<T>(
  fetcher: () => Promise<T>,
  options?: { key?: string; ttlMs?: number }
): () => Promise<T> {
  const cacheKey = options?.key ?? fetcher.toString()
  const ttlMs = options?.ttlMs ?? ONE_HOUR_MS

  async function fetchWithMemoryCache(): Promise<T> {
    const now = Date.now()
    const cached = memoryCache.get(cacheKey) as CacheEntry<T> | undefined

    if (cached && cached.expiresAt > now) {
      return cached.data
    }

    const data = await fetcher()

    memoryCache.set(cacheKey, {
      data,
      expiresAt: now + ttlMs,
    })

    return data
  }

  // Wrap with React's cache for per-request deduplication
  return cache(fetchWithMemoryCache)
}

/**
 * Clears all entries from the memory cache.
 * Useful for testing or forcing a refresh after deployment.
 */
export function clearMemoryCache(): void {
  memoryCache.clear()
}
