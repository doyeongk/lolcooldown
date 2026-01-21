'use client'

import { useState, useEffect } from 'react'

/**
 * SSR-safe media query hook.
 * Returns false during SSR/hydration, then updates on client.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * Convenience hook for mobile detection (< 768px).
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Detect iOS Safari specifically (for working around WebKit bugs).
 * Returns false during SSR, then updates on client.
 */
export function useIsIOSSafari(): boolean {
  const [isIOSSafari, setIsIOSSafari] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua)
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)
    setIsIOSSafari(isIOS && isSafari)
  }, [])

  return isIOSSafari
}
