'use client'

import { useEffect } from 'react'

export function ViewportHeight() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    setVh()
    window.addEventListener('resize', setVh)
    window.visualViewport?.addEventListener('resize', setVh)

    return () => {
      window.removeEventListener('resize', setVh)
      window.visualViewport?.removeEventListener('resize', setVh)
    }
  }, [])

  return null
}
