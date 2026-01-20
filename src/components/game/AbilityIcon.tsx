'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AbilityIconProps {
  icon: string | null
  name: string
  description: string | null
}

export function AbilityIcon({ icon, name, description }: AbilityIconProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    if (description) {
      setShowTooltip((prev) => !prev)
    }
  }

  const handleMouseEnter = () => {
    if (description) {
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-lg border-[3px] border-gold bg-dark-blue/60 shadow-[0_0_12px_rgba(227,207,116,0.3)] overflow-hidden flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50"
        aria-label={`${name} ability info`}
      >
        {icon ? (
          <Image
            src={icon}
            alt={name}
            fill
            sizes="(max-width: 640px) 48px, 64px"
            className="object-cover"
          />
        ) : null}
      </button>

      {/* Tooltip */}
      {showTooltip && description && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 md:w-80 p-4 bg-dark-blue/95 backdrop-blur-sm border border-gold/30 rounded-lg shadow-lg animate-tooltip-fade-in z-20"
          role="tooltip"
        >
          <p className="text-base leading-relaxed text-foreground/90">{description}</p>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-dark-blue/95" />
        </div>
      )}
    </div>
  )
}
