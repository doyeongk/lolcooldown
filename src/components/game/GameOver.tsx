'use client'

import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GameOverProps {
  open: boolean
  score: number
  best: number
  isNewBest: boolean
  onRestart: () => void
}

const CORNERS = ['-top-px -left-px border-t-2 border-l-2', '-top-px -right-px border-t-2 border-r-2', '-bottom-px -left-px border-b-2 border-l-2', '-bottom-px -right-px border-b-2 border-r-2']

// Contents rise in 60ms apart once the dialog has started scaling in
const step = (i: number) => ({ animationDelay: `${80 + i * 60}ms`, '--fade-y': '8px', animationDuration: '300ms' }) as React.CSSProperties

export function GameOver({ open, score, best, isNewBest, onRestart }: GameOverProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm text-center shadow-[0_0_30px_rgba(227,207,116,0.2)]">
        {CORNERS.map((corner) => (
          <div key={corner} className={cn('absolute w-4 h-4 border-gold/60', corner)} />
        ))}
        <VisuallyHidden>
          <DialogDescription>Game over screen showing your final score</DialogDescription>
        </VisuallyHidden>

        <DialogTitle
          className="animate-fade-up text-3xl font-bold text-foreground"
          style={{ ...step(0), textShadow: '0 0 30px rgba(var(--gold-rgb), 0.3)' }}
        >
          Game Over
        </DialogTitle>

        <div className="animate-fade-up space-y-4 mb-4" style={step(1)}>
          <div>
            <p className="text-sm text-foreground/60">Final Score</p>
            <p className="text-5xl font-bold tabular-nums text-gold" style={{ textShadow: '0 0 20px rgba(var(--gold-rgb), 0.4)' }}>
              {score}
            </p>
            {isNewBest && (
              <p className="animate-fade-up mt-1 text-sm font-semibold uppercase tracking-[0.15em] text-gold" style={step(3)}>
                New High Score
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-foreground/60">High Score</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">{best}</p>
          </div>
        </div>

        <div className="animate-fade-up flex flex-col gap-3" style={step(2)}>
          {/* Radix focuses this first, so Enter plays again; the arrow spins back on hover */}
          <Button variant="primary" size="lg" onClick={onRestart} className="group w-full">
            <RotateCcw className="transition-transform duration-300 ease-(--ease-out) group-hover:-rotate-180 motion-reduce:transition-none" aria-hidden="true" />
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
