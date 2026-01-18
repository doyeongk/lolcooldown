import { useEffect } from 'react'

/**
 * Preloads images into browser cache for smoother transitions.
 * Uses native Image() constructor to trigger browser fetch.
 */
export function useImagePreloader(urls: (string | null | undefined)[]) {
  // Join for stable dependency - avoids re-runs when array reference changes
  const urlKey = urls.filter(Boolean).join(',')

  useEffect(() => {
    if (typeof window === 'undefined' || !urlKey) return

    urlKey.split(',').forEach((url) => {
      const img = new window.Image()
      img.src = url
    })
  }, [urlKey])
}
