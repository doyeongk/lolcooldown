'use client'

import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion, gameContainerVariants, fadeIn } from '@/lib/motion'

interface ScoreDisplayProps {
  score: number
  highScore: number
  lives: number
  maxLives?: number
}

export function ScoreDisplay({ score, highScore, lives, maxLives = 3 }: ScoreDisplayProps) {
  const prefersReducedMotion = useReducedMotion()

  const scoreTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 400, damping: 20 }

  const heartTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 20 }

  return (
    <motion.div
      variants={gameContainerVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      className="
        relative inline-flex items-center gap-4 md:gap-6
        px-4 md:px-6 py-2 md:py-3
        bg-dark-blue/80 backdrop-blur-sm
        rounded-lg border border-gold/30
        shadow-[0_0_12px_rgba(227,207,116,0.15)]
      "
    >
      {/* Corner bracket - top left */}
      <div className="absolute -top-px -left-px w-2.5 h-2.5 border-t border-l border-gold/50" />
      {/* Corner bracket - bottom right */}
      <div className="absolute -bottom-px -right-px w-2.5 h-2.5 border-b border-r border-gold/50" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/60 uppercase tracking-wide">Best</span>
        <span className="text-lg md:text-xl font-bold text-foreground">{highScore}</span>
      </div>

      <div className="w-px h-6 bg-white/20" />

      <div className="flex gap-1" aria-label={`${lives} lives remaining`}>
        {Array.from({ length: maxLives }).map((_, i) => (
          <motion.span
            key={i}
            animate={{
              scale: prefersReducedMotion ? 1 : (i < lives ? 1 : 0.8),
              opacity: i < lives ? 1 : 0.3,
            }}
            transition={heartTransition}
          >
            <Heart
              className={`w-5 h-5 md:w-6 md:h-6 ${i < lives ? 'fill-red-500 text-red-500' : 'text-red-500/50'}`}
              aria-hidden="true"
            />
          </motion.span>
        ))}
      </div>

      <div className="w-px h-6 bg-white/20" />

      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/60 uppercase tracking-wide">Score</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={prefersReducedMotion ? false : { scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
            transition={scoreTransition}
            className="text-lg md:text-xl font-bold text-gold"
          >
            {score}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
