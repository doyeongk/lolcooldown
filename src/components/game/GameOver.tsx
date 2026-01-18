'use client'

import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface GameOverProps {
  score: number
  highScore: number
  isNewHighScore: boolean
  onRestart: () => void
}

export function GameOver({ score, highScore, isNewHighScore, onRestart }: GameOverProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-blue border border-gold/50 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Game Over</h2>

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
          <Link href="/" className="w-full">
            <Button variant="secondary" size="md" className="w-full">
              Back to Menu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
