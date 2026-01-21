'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface GameOverProps {
  open: boolean
  score: number
  highScore: number
  isNewHighScore: boolean
  onRestart: () => void
}

export function GameOver({ open, score, highScore, isNewHighScore, onRestart }: GameOverProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm text-center [&>button]:hidden">
        <VisuallyHidden>
          <DialogDescription>Game over screen showing your final score</DialogDescription>
        </VisuallyHidden>
        <DialogTitle className="text-3xl font-bold text-foreground mb-2">Game Over</DialogTitle>

        {isNewHighScore && (
          <p className="text-gold text-lg mb-4 animate-pulse">New High Score!</p>
        )}

        <div className="space-y-4 mb-8">
          <div>
            <p className="text-sm text-foreground/60">Final Score</p>
            <p className="text-4xl font-bold text-gold">{score}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/60">High Score</p>
            <p className="text-2xl font-semibold text-foreground">{highScore}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="primary" size="lg" onClick={onRestart} className="w-full">
            Try Again
          </Button>
          <Button asChild variant="secondary" size="md" className="w-full">
            <Link href="/">Back to Menu</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
