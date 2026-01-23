import { useEffect, useState } from 'react'

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

/**
 * Preloads images and tracks loading state.
 * Returns true once all images are loaded.
 */
export function useImagePreloaderWithState(urls: (string | null | undefined)[]): boolean {
  const [loaded, setLoaded] = useState(false)
  const urlKey = urls.filter(Boolean).join(',')

  useEffect(() => {
    // Reset loaded state when URLs change
    setLoaded(false)

    if (typeof window === 'undefined' || !urlKey) {
      setLoaded(true)
      return
    }

    const validUrls = urlKey.split(',')
    let loadedCount = 0
    let cancelled = false

    function checkAllLoaded() {
      loadedCount++
      if (!cancelled && loadedCount === validUrls.length) {
        setLoaded(true)
      }
    }

    validUrls.forEach((url) => {
      const img = new window.Image()
      img.onload = checkAllLoaded
      img.onerror = checkAllLoaded
      img.src = url
    })

    return () => {
      cancelled = true
    }
  }, [urlKey])

  return loaded
}
