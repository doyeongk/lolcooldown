'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useReducedMotion, numberPop, goldGlowPulse } from '@/lib/motion'

interface GameOverProps {
  open: boolean
  score: number
  highScore: number
  isNewHighScore: boolean
  onRestart: () => void
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
}

export function GameOver({ open, score, highScore, isNewHighScore, onRestart }: GameOverProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <Dialog open={open}>
      <DialogContent className="relative max-w-sm text-center [&>button]:hidden shadow-[0_0_30px_rgba(227,207,116,0.2)]" data-testid="game-over">
        {/* Corner bracket decorations */}
        <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-gold/60" />
        <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-gold/60" />
        <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-gold/60" />
        <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-gold/60" />

        <VisuallyHidden>
          <DialogDescription>Game over screen showing your final score</DialogDescription>
        </VisuallyHidden>

        <motion.div
          variants={staggerContainer}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
        >
          <motion.div variants={fadeInUp}>
            <DialogTitle
              className="text-3xl font-bold text-foreground mb-2"
              style={{ textShadow: '0 0 30px rgba(var(--gold-rgb), 0.3)' }}
            >
              Game Over
            </DialogTitle>
          </motion.div>

          <AnimatePresence>
            {isNewHighScore && (
              <motion.p
                variants={prefersReducedMotion ? undefined : goldGlowPulse}
                initial={prefersReducedMotion ? undefined : 'initial'}
                animate={prefersReducedMotion ? undefined : 'animate'}
                className="text-gold text-lg mb-4"
              >
                New High Score!
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div variants={fadeInUp} className="space-y-4 mb-8">
            <div>
              <p className="text-sm text-foreground/60">Final Score</p>
              <motion.p
                variants={prefersReducedMotion ? undefined : numberPop}
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                className="text-4xl font-bold text-gold"
                style={{ textShadow: '0 0 20px rgba(var(--gold-rgb), 0.4)' }}
              >
                {score}
              </motion.p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">High Score</p>
              <p className="text-2xl font-semibold text-foreground">{highScore}</p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col gap-3">
            <Button variant="primary" size="lg" onClick={onRestart} className="w-full" data-testid="restart-button">
              Try Again
            </Button>
            <Button asChild variant="secondary" size="md" className="w-full">
              <Link href="/">Back to Menu</Link>
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
