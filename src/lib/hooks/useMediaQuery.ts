'use client'

import { useSyncExternalStore, useCallback } from 'react'

/**
 * SSR-safe media query hook using useSyncExternalStore.
 * Returns false during SSR/hydration, then updates on client.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', callback)
      return () => mediaQuery.removeEventListener('change', callback)
    },
    [query]
  )

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches
  }, [query])

  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Convenience hook for mobile detection (< 768px).
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
