'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useReducedMotion, gameContainerVariants } from '@/lib/motion'

// Module-level transition objects to avoid re-creation on each render
const instantTransition = { duration: 0 } as const
const scoreSpringTransition = { type: 'spring' as const, stiffness: 400, damping: 20 }
const lifeSpringTransition = { type: 'spring' as const, stiffness: 300, damping: 20 }

interface ScoreDisplayProps {
  score: number
  highScore: number
  lives: number
  maxLives?: number
}

// Shield-shaped life indicator
function LifeShield({ filled }: { filled: boolean }) {
  return (
    <Shield
      className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-200 ${
        filled
          ? 'fill-gold text-gold drop-shadow-[0_0_4px_rgba(201,162,39,0.5)]'
          : 'fill-transparent text-gold/25'
      }`}
      strokeWidth={filled ? 2 : 1.5}
    />
  )
}

export const ScoreDisplay = memo(function ScoreDisplay({ score, highScore, lives, maxLives = 3 }: ScoreDisplayProps) {
  const isBeatingHighScore = score > highScore
  const prefersReducedMotion = useReducedMotion()

  const scoreTransition = prefersReducedMotion ? instantTransition : scoreSpringTransition

  return (
    <motion.div
      variants={gameContainerVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      className="
        inline-flex items-center gap-3 md:gap-4
        px-4 md:px-5 py-2 md:py-2.5
        rounded-full
        bg-gradient-to-b from-black/50 to-black/60
        backdrop-blur-sm
        border border-gold/20
        shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]
      "
    >
      {/* Best Score */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] md:text-xs font-semibold text-gold/70 uppercase tracking-[0.15em]">Best</span>
        <span className={`text-base md:text-lg font-bold tabular-nums ${isBeatingHighScore ? 'text-foreground' : 'text-gold'}`}>{highScore}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 md:h-7 bg-gold/20" />

      {/* Lives - shield indicators */}
      <div className="flex items-center gap-1.5 md:gap-2" aria-label={`${lives} lives remaining`}>
        {Array.from({ length: maxLives }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: prefersReducedMotion ? 1 : (i < lives ? 1 : 0.75),
              opacity: i < lives ? 1 : 0.4,
            }}
            transition={prefersReducedMotion ? instantTransition : lifeSpringTransition}
          >
            <LifeShield filled={i < lives} />
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 md:h-7 bg-gold/20" />

      {/* Current Score */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] md:text-xs font-semibold text-gold/70 uppercase tracking-[0.15em]">Score</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={prefersReducedMotion ? false : { scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
            transition={scoreTransition}
            className={`text-base md:text-lg font-bold tabular-nums ${score >= highScore ? 'text-gold' : 'text-foreground'}`}
          >
            {score}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  )
})
