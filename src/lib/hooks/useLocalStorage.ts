'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
    setIsHydrated(true)
  }, [key])

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  return [isHydrated ? storedValue : initialValue, setValue]
}
