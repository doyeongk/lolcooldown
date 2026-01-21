'use client'

import { useSyncExternalStore, useCallback, useRef } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Use ref to store initialValue for stable getServerSnapshot
  const initialValueRef = useRef(initialValue)

  const subscribe = useCallback(
    (callback: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key || e.key === null) callback()
      }
      window.addEventListener('storage', handler)
      // Also listen for custom events from same-tab updates
      window.addEventListener(`localStorage:${key}`, callback)
      return () => {
        window.removeEventListener('storage', handler)
        window.removeEventListener(`localStorage:${key}`, callback)
      }
    },
    [key]
  )

  const getSnapshot = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValueRef.current
    } catch {
      return initialValueRef.current
    }
  }, [key])

  const getServerSnapshot = () => initialValueRef.current

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setValue = useCallback(
    (newValue: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue))
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event(`localStorage:${key}`))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  return [value, setValue]
}
