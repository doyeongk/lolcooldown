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

  // Desktop inline layout - full-width stacked buttons anchored at bottom
  return (
    <div className="hidden md:flex flex-col gap-3 w-full max-w-sm lg:max-w-md">
      <motion.button
        type="button"
        onClick={() => onGuess('higher')}
        disabled={disabled}
        whileHover={!prefersReducedMotion && !disabled ? { scale: 1.02, boxShadow: '0 0 32px rgba(201,162,39,0.5), 0 6px 20px rgba(0,0,0,0.4)' } : undefined}
        whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
        transition={springTransition}
        className="
          relative flex items-center justify-center gap-3
          px-8 py-5 lg:py-6
          text-dark-blue font-bold text-lg lg:text-xl uppercase tracking-wider
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed
          touch-manipulation
          overflow-hidden
        "
        style={{
          // Angular button shape
          clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
          background: 'linear-gradient(180deg, #f5e8a3 0%, #d4a84b 30%, #c9a227 70%, #a88a1f 100%)',
          boxShadow: '0 0 24px rgba(201,162,39,0.4), 0 4px 16px rgba(0,0,0,0.4)',
        }}
        aria-label="Guess higher cooldown"
      >
        {/* Inner border frame */}
        <div
          className="absolute inset-[2px] pointer-events-none"
          style={{
            clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
          aria-hidden="true"
        />
        {/* Top highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.15) 100%)',
          }}
          aria-hidden="true"
        />
        <ChevronUp className="w-6 h-6 lg:w-7 lg:h-7 relative z-10" strokeWidth={3} aria-hidden="true" />
        <span className="relative z-10">Higher</span>
      </motion.button>

      <motion.button
        type="button"
        onClick={() => onGuess('lower')}
        disabled={disabled}
        whileHover={!prefersReducedMotion && !disabled ? { scale: 1.02, boxShadow: '0 0 24px rgba(201,162,39,0.25), 0 6px 20px rgba(0,0,0,0.5)' } : undefined}
        whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
        transition={springTransition}
        className="
          relative flex items-center justify-center gap-3
          px-8 py-5 lg:py-6
          text-foreground font-bold text-lg lg:text-xl uppercase tracking-wider
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed
          touch-manipulation
          overflow-hidden
        "
        style={{
          // Angular button shape
          clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
          background: 'linear-gradient(180deg, rgba(30,45,60,0.95) 0%, rgba(15,26,36,0.98) 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(201,162,39,0.3), 0 4px 16px rgba(0,0,0,0.5)',
        }}
        aria-label="Guess lower cooldown"
      >
        {/* Inner border frame */}
        <div
          className="absolute inset-[2px] pointer-events-none"
          style={{
            clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)',
            border: '1px solid rgba(201,162,39,0.15)',
          }}
          aria-hidden="true"
        />
        {/* Subtle highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.1) 100%)',
          }}
          aria-hidden="true"
        />
        <ChevronDown className="w-6 h-6 lg:w-7 lg:h-7 relative z-10" strokeWidth={3} aria-hidden="true" />
        <span className="relative z-10">Lower</span>
      </motion.button>
    </div>
  )
}
