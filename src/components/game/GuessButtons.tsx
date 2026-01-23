'use client'

import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useReducedMotion } from '@/lib/motion'
import type { GuessChoice } from '@/types/game'

interface GuessButtonsProps {
  onGuess: (choice: GuessChoice) => void
  disabled: boolean
  /** Hide buttons with opacity (for mobile transitions) */
  hidden?: boolean
  /** Variant: 'inline' for desktop in-panel, 'fixed' for mobile fixed bottom */
  variant?: 'inline' | 'fixed'
}

const springTransition = { type: 'spring', stiffness: 400, damping: 25 } as const

// Corner accent component for rectangular buttons
function CornerAccent({ position }: { position: 'top-left' | 'bottom-right' }) {
  const positionClasses = position === 'top-left'
    ? "-top-px -left-px border-t border-l"
    : "-bottom-px -right-px border-b border-r"

  return (
    <div
      className={`absolute w-3 h-3 ${positionClasses} border-dark-blue/30 pointer-events-none`}
      aria-hidden="true"
    />
  )
}

export function GuessButtons({ onGuess, disabled, hidden = false, variant = 'inline' }: GuessButtonsProps) {
  const prefersReducedMotion = useReducedMotion()

  if (variant === 'fixed') {
    // Mobile fixed bottom layout - rounded for touch friendliness
    return (
      <motion.div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm"
        animate={{ opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: hidden ? 'none' : 'auto' }}
      >
        <div className="flex gap-3 max-w-md mx-auto">
          <motion.button
            type="button"
            onClick={() => onGuess('lower')}
            disabled={disabled}
            whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
            whileHover={!prefersReducedMotion && !disabled ? { boxShadow: '0 0 20px rgba(var(--gold-rgb), 0.3)' } : undefined}
            transition={springTransition}
            className="relative flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-lg bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm text-foreground font-bold text-base uppercase tracking-wide border-2 border-gold/30 shadow-lg shadow-black/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation hover:border-gold/60"
            aria-label="Guess lower cooldown"
          >
            <ChevronDown className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
            Lower
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onGuess('higher')}
            disabled={disabled}
            whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
            transition={springTransition}
            className="relative flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-lg bg-gold text-dark-blue font-bold text-base uppercase tracking-wide shadow-[0_0_16px_rgba(227,207,116,0.3)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation hover:shadow-[0_0_24px_rgba(227,207,116,0.5)]"
            aria-label="Guess higher cooldown"
          >
            <ChevronUp className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
            Higher
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // Desktop inline layout - rectangular cards with corner accents
  return (
    <div className="hidden md:flex flex-col gap-4 w-56">
      <motion.button
        type="button"
        onClick={() => onGuess('higher')}
        disabled={disabled}
        whileHover={!prefersReducedMotion && !disabled ? { x: 4 } : undefined}
        whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
        transition={springTransition}
        className="
          relative flex items-center justify-center gap-2
          px-6 py-5
          bg-gold text-dark-blue font-bold text-lg uppercase tracking-wide
          border border-gold
          shadow-[0_0_16px_rgba(227,207,116,0.3)]
          transition-all duration-200
          hover:shadow-[0_0_24px_rgba(227,207,116,0.5)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed
          touch-manipulation
        "
        aria-label="Guess higher cooldown"
      >
        <CornerAccent position="top-left" />
        <CornerAccent position="bottom-right" />
        <ChevronUp className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
        Higher
      </motion.button>
      <motion.button
        type="button"
        onClick={() => onGuess('lower')}
        disabled={disabled}
        whileHover={!prefersReducedMotion && !disabled ? { x: 4, boxShadow: '0 0 20px rgba(var(--gold-rgb), 0.3)' } : undefined}
        whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
        transition={springTransition}
        className="
          relative flex items-center justify-center gap-2
          px-6 py-5
          bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm text-foreground font-bold text-lg uppercase tracking-wide
          border border-gold/30
          transition-all duration-200
          hover:border-gold/60
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed
          touch-manipulation
        "
        aria-label="Guess lower cooldown"
      >
        <CornerAccent position="top-left" />
        <CornerAccent position="bottom-right" />
        <ChevronDown className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
        Lower
      </motion.button>
    </div>
  )
}
