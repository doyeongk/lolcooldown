'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion, gameContainerVariants } from '@/lib/motion'

interface ScoreDisplayProps {
  score: number
  highScore: number
  lives: number
  maxLives?: number
}

// Diamond-shaped life indicator
function LifeDiamond({ filled }: { filled: boolean }) {
  return (
    <div
      className={`w-3.5 h-3.5 md:w-4 md:h-4 rotate-45 transition-all duration-200 ${
        filled
          ? 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
          : 'bg-dark-blue/40 border border-red-500/20'
      }`}
      style={{
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      }}
    />
  )
}

export function ScoreDisplay({ score, highScore, lives, maxLives = 3 }: ScoreDisplayProps) {
  const prefersReducedMotion = useReducedMotion()

  const scoreTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 400, damping: 20 }

  return (
    <motion.div
      variants={gameContainerVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      className="
        inline-flex items-center gap-3 md:gap-4
        px-4 md:px-5 py-2 md:py-2.5
        rounded-full
        bg-black/60 backdrop-blur-md
        border border-gold/20
        shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]
      "
    >
      {/* Best Score */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] md:text-[10px] text-gold/60 uppercase tracking-[0.15em]">Best</span>
        <span className="text-base md:text-lg font-bold text-foreground tabular-nums">{highScore}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 md:h-7 bg-gold/20" />

      {/* Lives - diamond indicators */}
      <div className="flex items-center gap-1.5 md:gap-2" aria-label={`${lives} lives remaining`}>
        {Array.from({ length: maxLives }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: prefersReducedMotion ? 1 : (i < lives ? 1 : 0.75),
              opacity: i < lives ? 1 : 0.4,
            }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20 }}
          >
            <LifeDiamond filled={i < lives} />
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 md:h-7 bg-gold/20" />

      {/* Current Score */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] md:text-[10px] text-gold/60 uppercase tracking-[0.15em]">Score</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={prefersReducedMotion ? false : { scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
            transition={scoreTransition}
            className="text-base md:text-lg font-bold text-gold tabular-nums"
          >
            {score}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
