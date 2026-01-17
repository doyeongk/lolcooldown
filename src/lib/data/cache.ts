import { cache } from 'react'

// Per-request deduplication wrapper
export function createCachedFetcher<T>(
  fetcher: () => Promise<T>
) {
  return cache(fetcher)
}
