'use client'

import { memo } from 'react'
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

// Module-level transition objects to avoid re-creation on each render
const springTransition = { type: 'spring', stiffness: 400, damping: 25 } as const
const buttonSpringTransition = { type: 'spring', stiffness: 400, damping: 30 } as const

export const GuessButtons = memo(function GuessButtons({ onGuess, disabled, hidden = false, variant = 'inline' }: GuessButtonsProps) {
  const prefersReducedMotion = useReducedMotion()

  if (variant === 'fixed') {
    // Mobile fixed bottom layout - uses clamp() for proportional scaling across viewport sizes
    return (
      <motion.div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-[clamp(0.75rem,2vh,1rem)] pb-[calc(clamp(0.5rem,1.5vh,1rem)+env(safe-area-inset-bottom))] backdrop-blur-sm"
        animate={{ opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: hidden ? 'none' : 'auto' }}
      >
        <div className="flex gap-[clamp(0.5rem,1.5vh,0.75rem)] max-w-md mx-auto">
          <motion.button
            type="button"
            onClick={() => onGuess('lower')}
            disabled={disabled}
            whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
            whileHover={!prefersReducedMotion && !disabled ? { boxShadow: '0 0 20px rgba(var(--gold-rgb), 0.3)' } : undefined}
            transition={springTransition}
            className="relative flex-1 flex items-center justify-center gap-[clamp(0.25rem,1vh,0.5rem)] px-[clamp(0.75rem,2vh,1rem)] py-[clamp(0.5rem,1.5vh,0.75rem)] rounded-lg bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm text-foreground font-bold text-[clamp(0.875rem,1.8vh,1rem)] uppercase tracking-wide border-2 border-gold/30 shadow-lg shadow-black/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation hover:border-gold/60"
            aria-label="Guess lower cooldown"
            data-testid="lower-button"
          >
            <ChevronDown className="w-[clamp(1rem,2.5vh,1.25rem)] h-[clamp(1rem,2.5vh,1.25rem)]" strokeWidth={3} aria-hidden="true" />
            Lower
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onGuess('higher')}
            disabled={disabled}
            whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
            transition={springTransition}
            className="relative flex-1 flex items-center justify-center gap-[clamp(0.25rem,1vh,0.5rem)] px-[clamp(0.75rem,2vh,1rem)] py-[clamp(0.5rem,1.5vh,0.75rem)] rounded-lg bg-gold text-dark-blue font-bold text-[clamp(0.875rem,1.8vh,1rem)] uppercase tracking-wide shadow-[0_0_16px_rgba(227,207,116,0.3)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation hover:shadow-[0_0_24px_rgba(227,207,116,0.5)]"
            aria-label="Guess higher cooldown"
            data-testid="higher-button"
          >
            <ChevronUp className="w-[clamp(1rem,2.5vh,1.25rem)] h-[clamp(1rem,2.5vh,1.25rem)]" strokeWidth={3} aria-hidden="true" />
            Higher
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // Desktop inline layout - rectangular buttons matching home page theme
  return (
    <div className="hidden md:flex flex-col gap-3 w-full max-w-sm lg:max-w-md">
      {/* HIGHER button - primary style */}
      <motion.button
        type="button"
        onClick={() => onGuess('higher')}
        disabled={disabled}
        whileHover={!prefersReducedMotion && !disabled ? { x: 4 } : undefined}
        whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
        transition={buttonSpringTransition}
        className="
          relative flex items-center justify-center gap-3
          px-8 py-5 lg:py-6
          bg-gradient-to-b from-black/50 to-black/60
          backdrop-blur-sm
          border border-gold/50
          hover:border-gold
          hover:shadow-[0_0_20px_rgba(201,162,39,0.3)]
          text-gold font-bold text-lg lg:text-xl uppercase tracking-wider
          transition-all duration-300
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        aria-label="Guess higher cooldown"
        data-testid="higher-button"
      >
        {/* Corner accents */}
        <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-gold" />
        <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-gold" />
        <ChevronUp className="w-6 h-6" strokeWidth={3} aria-hidden="true" />
        Higher
      </motion.button>

      {/* LOWER button - secondary style */}
      <motion.button
        type="button"
        onClick={() => onGuess('lower')}
        disabled={disabled}
        whileHover={!prefersReducedMotion && !disabled ? { x: 4 } : undefined}
        whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
        transition={buttonSpringTransition}
        className="
          relative flex items-center justify-center gap-3
          px-8 py-5 lg:py-6
          bg-gradient-to-b from-black/50 to-black/60
          backdrop-blur-sm
          border border-gold/30
          hover:border-gold/60
          hover:shadow-[0_0_16px_rgba(201,162,39,0.15)]
          text-foreground font-bold text-lg lg:text-xl uppercase tracking-wider
          transition-all duration-300
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        aria-label="Guess lower cooldown"
        data-testid="lower-button"
      >
        <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-gold/30 group-hover:border-gold/60" />
        <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-gold/30 group-hover:border-gold/60" />
        <ChevronDown className="w-6 h-6" strokeWidth={3} aria-hidden="true" />
        Lower
      </motion.button>
    </div>
  )
})
