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

export function GuessButtons({ onGuess, disabled, hidden = false, variant = 'inline' }: GuessButtonsProps) {
  const prefersReducedMotion = useReducedMotion()

  if (variant === 'fixed') {
    // Mobile fixed bottom layout
    return (
      <motion.div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
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
            transition={springTransition}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/20 text-foreground font-bold text-base border-2 border-white/40 shadow-lg shadow-black/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation"
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
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gold text-dark-blue font-bold text-base shadow-lg shadow-black/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation"
            aria-label="Guess higher cooldown"
          >
            <ChevronUp className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
            Higher
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // Desktop inline layout (hidden on mobile)
  return (
    <div className="hidden md:flex flex-col gap-3 w-48">
      <motion.button
        type="button"
        onClick={() => onGuess('higher')}
        disabled={disabled}
        whileHover={!prefersReducedMotion && !disabled ? { scale: 1.05 } : undefined}
        whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
        transition={springTransition}
        className="
          flex items-center justify-center gap-2
          px-6 py-3 rounded-full
          bg-gold text-dark-blue font-bold text-lg
          transition-colors duration-200
          hover:bg-gold-hover
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed
          touch-manipulation
        "
        aria-label="Guess higher cooldown"
      >
        <ChevronUp className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
        Higher
      </motion.button>
      <motion.button
        type="button"
        onClick={() => onGuess('lower')}
        disabled={disabled}
        whileHover={!prefersReducedMotion && !disabled ? { scale: 1.05 } : undefined}
        whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
        transition={springTransition}
        className="
          flex items-center justify-center gap-2
          px-6 py-3 rounded-full
          bg-white/10 text-foreground font-bold text-lg
          border border-white/30
          transition-colors duration-200
          hover:bg-white/20
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed
          touch-manipulation
        "
        aria-label="Guess lower cooldown"
      >
        <ChevronDown className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
        Lower
      </motion.button>
    </div>
  )
}
