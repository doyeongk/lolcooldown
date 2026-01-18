'use client'

export function VsDivider() {
  return (
    <div className="flex items-center justify-center">
      <div
        className="
          w-16 h-16 md:w-20 md:h-20
          rounded-full bg-gold
          flex items-center justify-center
          border-4 border-dark-blue
          shadow-[0_0_30px_rgba(227,207,116,0.5)]
        "
      >
        <span className="text-dark-blue font-bold text-xl md:text-2xl">VS</span>
      </div>
    </div>
  )
}
