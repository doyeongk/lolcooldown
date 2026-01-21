'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'

function getStorageValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  } catch {
    return initialValue
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Use useSyncExternalStore for localStorage to avoid hydration mismatches
  const subscribe = useCallback(
    (callback: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) callback()
      }
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    },
    [key]
  )

  const getSnapshot = useCallback(() => {
    return JSON.stringify(getStorageValue(key, initialValue))
  }, [key, initialValue])

  const getServerSnapshot = useCallback(() => {
    return JSON.stringify(initialValue)
  }, [initialValue])

  const serializedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const value = JSON.parse(serializedValue) as T

  // Local state for immediate updates (external store only notifies on storage events)
  const [localValue, setLocalValue] = useState<T | null>(null)

  const setValue = useCallback(
    (newValue: T) => {
      try {
        setLocalValue(newValue)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(newValue))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  return [localValue ?? value, setValue]
}
