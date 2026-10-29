import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScoreDisplayProps {
  score: number
  /** Best streak when this game started: the number to beat */
  best: number
  lives: number
  maxLives: number
}

const label = 'text-[clamp(0.5rem,1.2vh,0.625rem)] md:text-xs font-semibold text-gold/70 uppercase tracking-[0.15em]'
const value = 'text-[clamp(0.875rem,1.8vh,1rem)] md:text-lg font-bold tabular-nums'
const divider = <div className="w-px h-[clamp(1.25rem,3vh,1.75rem)] md:h-7 bg-gold/20" />

export function ScoreDisplay({ score, best, lives, maxLives }: ScoreDisplayProps) {
  return (
    <div className="inline-flex items-center gap-[clamp(0.5rem,1.5vh,0.75rem)] md:gap-4 px-[clamp(0.75rem,2vh,1rem)] md:px-5 py-[clamp(0.375rem,1vh,0.5rem)] md:py-2.5 rounded-full bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm border border-gold/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col items-center">
        <span className={label}>Best</span>
        <span className={cn(value, score > best ? 'text-foreground' : 'text-gold')}>{best}</span>
      </div>

      {divider}

      {/* Lives: a lost shield flares red, flinches and settles dim; a refill eases back */}
      <div className="flex items-center gap-[clamp(0.25rem,0.8vh,0.5rem)] md:gap-2" role="img" aria-label={`${lives} lives remaining`}>
        {Array.from({ length: maxLives }, (_, i) => {
          const filled = i < lives
          return (
            <Shield
              key={i}
              aria-hidden="true"
              strokeWidth={filled ? 2 : 1.5}
              className={cn(
                'w-[clamp(0.75rem,2vh,1rem)] h-[clamp(0.75rem,2vh,1rem)] md:w-5 md:h-5 transition-[scale,opacity,color,fill] duration-300 ease-(--ease-out)',
                filled
                  ? 'fill-gold text-gold drop-shadow-[0_0_4px_rgba(201,162,39,0.5)]'
                  : 'animate-life-lost fill-transparent text-gold/25 scale-75 opacity-40'
              )}
            />
          )
        })}
      </div>

      {divider}

      <div className="flex flex-col items-center">
        <span className={label}>Score</span>
        <span key={score} className={cn(value, 'animate-score-tick', score >= best ? 'text-gold' : 'text-foreground')}>
          {score}
        </span>
      </div>
    </div>
  )
}
