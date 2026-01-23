'use client'

import { cn } from '@/lib/utils'

interface LevelPipsProps {
  level: number
  slot: 'Q' | 'W' | 'E' | 'R' | 'P'
}

export function LevelPips({ level, slot }: LevelPipsProps) {
  const maxLevel = slot === 'R' ? 3 : slot === 'P' ? 1 : 5

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm border border-gold/30 rounded-sm">
      <span className="text-xs text-gold/60 uppercase tracking-wider mr-1">Lv</span>
      {Array.from({ length: maxLevel }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-2.5 h-2.5 md:w-3 md:h-3 rotate-45 transition-all duration-200",
            i < level
              ? "bg-gradient-to-br from-[#f5e8a3] via-gold to-[#a88a1f] shadow-[0_0_8px_rgba(201,162,39,0.8)]"
              : "bg-black/50 border border-gold/40"
          )}
        />
      ))}
    </div>
  )
}
