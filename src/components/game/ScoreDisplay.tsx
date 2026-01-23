'use client'

import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion, gameContainerVariants } from '@/lib/motion'

interface ScoreDisplayProps {
  score: number
  highScore: number
  lives: number
  maxLives?: number
}

// Angular stat block with beveled corners
function StatBlock({ label, value, variant = 'default' }: { label: string; value: React.ReactNode; variant?: 'default' | 'gold' }) {
  const isGold = variant === 'gold'

  return (
    <div className="relative flex flex-col items-center px-4 md:px-5 py-1.5 md:py-2">
      {/* Angular background shape */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
          background: isGold
            ? 'linear-gradient(180deg, rgba(201,162,39,0.15) 0%, rgba(201,162,39,0.05) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.1) 100%)',
        }}
      />
      {/* Inner border with angular clip */}
      <div
        className="absolute inset-[1px] pointer-events-none"
        style={{
          clipPath: 'polygon(7px 0, calc(100% - 7px) 0, 100% 7px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0 calc(100% - 7px), 0 7px)',
          border: isGold ? '1px solid rgba(201,162,39,0.3)' : '1px solid rgba(255,255,255,0.05)',
        }}
      />
      <span className="relative text-[9px] md:text-[10px] text-gold/60 uppercase tracking-[0.2em] font-medium">{label}</span>
      <span className={`relative text-lg md:text-xl font-bold ${isGold ? 'text-gold' : 'text-foreground'}`}>{value}</span>
    </div>
  )
}

// Diamond-shaped life indicator
function LifeDiamond({ filled }: { filled: boolean }) {
  return (
    <div
      className={`w-4 h-4 md:w-5 md:h-5 rotate-45 transition-all duration-200 ${
        filled
          ? 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6),inset_0_1px_0_rgba(255,255,255,0.3)]'
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
      className="inline-flex items-center gap-1 md:gap-2"
    >
      {/* High Score Block */}
      <StatBlock label="Best" value={highScore} />

      {/* Angular divider */}
      <div className="w-px h-8 md:h-10 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

      {/* Lives - diamond indicators */}
      <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3" aria-label={`${lives} lives remaining`}>
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

      {/* Angular divider */}
      <div className="w-px h-8 md:h-10 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

      {/* Score Block */}
      <div className="relative flex flex-col items-center px-4 md:px-5 py-1.5 md:py-2">
        {/* Angular background shape - gold variant */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
            background: 'linear-gradient(180deg, rgba(201,162,39,0.15) 0%, rgba(201,162,39,0.05) 100%)',
          }}
        />
        <div
          className="absolute inset-[1px] pointer-events-none"
          style={{
            clipPath: 'polygon(7px 0, calc(100% - 7px) 0, 100% 7px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0 calc(100% - 7px), 0 7px)',
            border: '1px solid rgba(201,162,39,0.3)',
          }}
        />
        <span className="relative text-[9px] md:text-[10px] text-gold/60 uppercase tracking-[0.2em] font-medium">Score</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={prefersReducedMotion ? false : { scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
            transition={scoreTransition}
            className="relative text-lg md:text-xl font-bold text-gold drop-shadow-[0_0_8px_rgba(201,162,39,0.4)]"
          >
            {score}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
