'use client'

interface ScoreDisplayProps {
  score: number
  highScore: number
  lives: number
  maxLives?: number
}

export function ScoreDisplay({ score, highScore, lives, maxLives = 3 }: ScoreDisplayProps) {
  return (
    <div
      className="
        inline-flex items-center gap-4 md:gap-6
        px-4 md:px-6 py-2 md:py-3
        bg-dark-blue/80 backdrop-blur-sm
        rounded-full border border-white/10
      "
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/60 uppercase tracking-wide">Best</span>
        <span className="text-lg md:text-xl font-bold text-foreground">{highScore}</span>
      </div>

      <div className="w-px h-6 bg-white/20" />

      <div className="flex gap-1" aria-label={`${lives} lives remaining`}>
        {Array.from({ length: maxLives }).map((_, i) => (
          <span
            key={i}
            className={`text-lg md:text-xl transition-opacity ${i < lives ? 'opacity-100' : 'opacity-30'}`}
            aria-hidden="true"
          >
            ❤️
          </span>
        ))}
      </div>

      <div className="w-px h-6 bg-white/20" />

      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/60 uppercase tracking-wide">Score</span>
        <span className="text-lg md:text-xl font-bold text-gold">{score}</span>
      </div>
    </div>
  )
}
