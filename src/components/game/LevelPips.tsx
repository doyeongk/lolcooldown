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
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5"
      style={{
        // Angular container shape
        clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0 50%)',
        background: 'linear-gradient(180deg, rgba(10,15,20,0.8) 0%, rgba(5,10,15,0.9) 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(201,162,39,0.2)',
      }}
    >
      {Array.from({ length: maxLevel }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-2.5 h-2.5 transition-all duration-200",
            i < level
              ? "bg-gradient-to-br from-[#f5e8a3] via-gold to-[#a88a1f] shadow-[0_0_6px_rgba(201,162,39,0.7)]"
              : "bg-dark-blue/50 border border-gold/20"
          )}
          style={{
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }}
        />
      ))}
    </div>
  )
}
