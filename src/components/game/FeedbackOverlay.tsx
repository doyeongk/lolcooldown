'use client'

import { useRef, useEffect } from 'react'
import { useReducedMotion } from '@/lib/motion'

interface FeedbackOverlayProps {
  isCorrect: boolean | null
}

export function FeedbackOverlay({ isCorrect }: FeedbackOverlayProps) {
  const prefersReducedMotion = useReducedMotion()
  const prevIsCorrectRef = useRef<boolean | null>(null)
  // Track last non-null value for colour during fade-out
  const lastColourRef = useRef<boolean>(true)

  // Track if this is a NEW incorrect guess (for shake animation)
  const isNewIncorrect = isCorrect === false && prevIsCorrectRef.current !== false

  useEffect(() => {
    prevIsCorrectRef.current = isCorrect
    // Only update colour ref when we have an actual value
    if (isCorrect !== null) {
      lastColourRef.current = isCorrect
    }
  }, [isCorrect])

  const isVisible = isCorrect !== null
  // Use current value if visible, otherwise use last colour for fade-out
  const showCorrectColour = isCorrect !== null ? isCorrect : lastColourRef.current

  return (
    <div
      className={`
        absolute inset-0 pointer-events-none
        transition-opacity duration-150 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${isNewIncorrect && !prefersReducedMotion ? 'animate-feedback-shake' : ''}
      `}
      style={{
        boxShadow: showCorrectColour === false
          ? 'inset 0 0 100px 40px rgba(239, 68, 68, 0.4)'
          : 'inset 0 0 80px 30px rgba(34, 197, 94, 0.35)',
      }}
    />
  )
}
