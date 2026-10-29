const ONE_HOUR_MS = 60 * 60 * 1000

/**
 * Memoises an async fetcher in memory for `ttlMs`. Caches the promise, so
 * concurrent callers share one query; a rejected fetch is not cached.
 */
export function createCachedFetcher<T>(fetcher: () => Promise<T>, ttlMs = ONE_HOUR_MS): () => Promise<T> {
  let entry: { data: Promise<T>; expiresAt: number } | null = null
  return () => {
    if (!entry || entry.expiresAt < Date.now()) {
      const data = fetcher()
      entry = { data, expiresAt: Date.now() + ttlMs }
      data.catch(() => { entry = null })
    }
    return entry.data
  }
}
