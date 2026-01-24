import { useEffect, useState, useRef, useCallback } from 'react'

// Global cache to track which images have been preloaded this session
const preloadedImages = new Set<string>()

/**
 * Preloads images into browser cache for smoother transitions.
 * Uses native Image() constructor to trigger browser fetch.
 * Tracks preloaded URLs globally to avoid redundant work.
 */
export function useImagePreloader(urls: (string | null | undefined)[]): void {
  const urlKey = urls.filter(Boolean).join(',')

  useEffect(() => {
    if (typeof window === 'undefined' || !urlKey) return

    urlKey.split(',').forEach((url) => {
      if (preloadedImages.has(url)) return

      const img = new window.Image()
      img.src = url
      img.decode()
        .then(() => {
          preloadedImages.add(url)
        })
        .catch(() => {
          // Still mark as attempted to avoid retrying failed images
          preloadedImages.add(url)
        })
    })
  }, [urlKey])
}

/**
 * Preloads images and tracks loading state.
 * Returns true once all images are loaded.
 * Checks global cache first for already-preloaded images.
 */
export function useImagePreloaderWithState(urls: (string | null | undefined)[]): boolean {
  const validUrls = urls.filter((url): url is string => Boolean(url))
  const urlKey = validUrls.join(',')

  // Check if all URLs are already in the global cache
  const allCached = validUrls.length === 0 || validUrls.every((url) => preloadedImages.has(url))

  const [loaded, setLoaded] = useState(allCached)

  useEffect(() => {
    // If all URLs are already cached, we're done
    if (allCached) {
      setLoaded(true)
      return
    }

    // Reset loaded state when URLs change
    setLoaded(false)

    if (typeof window === 'undefined' || !urlKey) {
      setLoaded(true)
      return
    }

    let loadedCount = 0
    let cancelled = false

    function checkAllLoaded(): void {
      loadedCount++
      if (!cancelled && loadedCount === validUrls.length) {
        setLoaded(true)
      }
    }

    validUrls.forEach((url) => {
      // If already cached, count as loaded immediately
      if (preloadedImages.has(url)) {
        checkAllLoaded()
        return
      }

      const img = new window.Image()
      img.src = url
      img.decode()
        .then(() => {
          preloadedImages.add(url)
          checkAllLoaded()
        })
        .catch(() => {
          preloadedImages.add(url)
          checkAllLoaded()
        })
    })

    return () => {
      cancelled = true
    }
  }, [urlKey, allCached, validUrls])

  return loaded
}

/**
 * Preloads images in the background and provides a callback to check readiness.
 * Does not block rendering - images load asynchronously.
 * Returns a function to check if specific URLs are ready.
 */
export function useBackgroundPreloader(): {
  preload: (urls: string[]) => void
  isReady: (urls: string[]) => boolean
} {
  const [, forceUpdate] = useState(0)
  const pendingRef = useRef(new Set<string>())

  const preload = useCallback((urls: string[]): void => {
    if (typeof window === 'undefined') return

    urls.forEach((url) => {
      if (preloadedImages.has(url) || pendingRef.current.has(url)) return

      pendingRef.current.add(url)
      const img = new window.Image()
      img.src = url
      img.decode()
        .then(() => {
          preloadedImages.add(url)
          pendingRef.current.delete(url)
          forceUpdate((n) => n + 1)
        })
        .catch(() => {
          preloadedImages.add(url)
          pendingRef.current.delete(url)
          forceUpdate((n) => n + 1)
        })
    })
  }, [])

  const isReady = useCallback((urls: string[]): boolean => {
    return urls.every((url) => preloadedImages.has(url))
  }, [])

  return { preload, isReady }
}
