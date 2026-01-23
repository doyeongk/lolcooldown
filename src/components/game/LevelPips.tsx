'use client'

import { cn } from '@/lib/utils'

interface LevelPipsProps {
  level: number
  slot: 'Q' | 'W' | 'E' | 'R' | 'P'
}

export function LevelPips({ level, slot }: LevelPipsProps) {
  // R abilities max at 3, others max at 5
  // P (passive) doesn't have levels, but treat as 1 pip if shown
  const maxLevel = slot === 'R' ? 3 : slot === 'P' ? 1 : 5

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: maxLevel }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-2.5 h-2.5 rounded-sm border transition-colors",
            i < level
              ? "bg-gold border-gold shadow-[0_0_6px_rgba(var(--gold-rgb),0.5)]"
              : "bg-transparent border-gold/40"
          )}
        />
      ))}
    </div>
  )
}
