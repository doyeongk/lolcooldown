'use client'

import { useRef, useEffect } from 'react'
import { useReducedMotion } from '@/lib/motion'

interface FeedbackOverlayProps {
  isCorrect: boolean | null
}

export function FeedbackOverlay({ isCorrect }: FeedbackOverlayProps) {
  const prefersReducedMotion = useReducedMotion()
  const prevIsCorrectRef = useRef<boolean | null>(null)

  // Track if this is a NEW incorrect guess (for shake animation)
  const isNewIncorrect = isCorrect === false && prevIsCorrectRef.current !== false

  useEffect(() => {
    prevIsCorrectRef.current = isCorrect
  }, [isCorrect])

  const isVisible = isCorrect !== null

  return (
    <div
      className={`
        absolute inset-0 pointer-events-none
        transition-opacity duration-150 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${isNewIncorrect && !prefersReducedMotion ? 'animate-feedback-shake' : ''}
      `}
      style={{
        background: isCorrect === false
          ? 'radial-gradient(ellipse 70% 60% at center, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.2) 40%, transparent 70%)'
          : 'radial-gradient(ellipse 70% 60% at center, rgba(34, 197, 94, 0.5) 0%, rgba(34, 197, 94, 0.25) 40%, transparent 70%)',
        boxShadow: isCorrect === false
          ? 'inset 0 0 80px 30px rgba(239, 68, 68, 0.35)'
          : 'inset 0 0 60px 20px rgba(34, 197, 94, 0.3)',
      }}
    />
  )
}
