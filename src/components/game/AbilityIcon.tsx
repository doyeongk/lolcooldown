'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Portal } from '@/components/ui/Portal'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import { sanitizeHtml } from '@/lib/utils/sanitizeHtml'

interface AbilityIconProps {
  icon: string | null
  name: string
  description: string | null
}

interface TooltipPosition {
  top: number
  left: number
}

export function AbilityIcon({ icon, name, description }: AbilityIconProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isMobile = useIsMobile()

  const handleClose = useCallback(() => {
    setShowTooltip(false)
  }, [])

  // Escape key handler
  useEffect(() => {
    if (!showTooltip) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showTooltip, handleClose])

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (showTooltip && isMobile) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [showTooltip, isMobile])

  const handleClick = () => {
    if (description) {
      setShowTooltip((prev) => !prev)
    }
  }

  const handleMouseEnter = () => {
    if (description && !isMobile && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top - 8, // Subtract arrow height for visual gap
        left: rect.left + rect.width / 2,
      })
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowTooltip(false)
    }
  }

  const sanitisedDescription = description ? sanitizeHtml(description) : ''

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-lg border-[3px] border-gold bg-dark-blue/60 shadow-[0_0_12px_rgba(227,207,116,0.3)] overflow-hidden flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50"
        aria-label={`${name} ability info`}
        aria-expanded={showTooltip}
        aria-haspopup="dialog"
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

      {/* Mobile: Bottom Sheet */}
      {showTooltip && description && isMobile && (
        <Portal>
          <div
            className="fixed inset-0 z-50 flex items-end justify-center animate-backdrop-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} ability description`}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Sheet */}
            <div className="relative w-full max-h-[70vh] bg-dark-blue border-t border-gold/30 rounded-t-2xl shadow-2xl animate-sheet-slide-up overflow-hidden overscroll-contain">
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gold/20 bg-dark-blue">
                <h3 className="text-lg font-semibold text-gold">{name}</h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 -mr-2 text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(70vh-64px)]">
                <div
                  className="ability-description text-base leading-relaxed text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: sanitisedDescription }}
                />
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Desktop: Floating Tooltip */}
      {showTooltip && description && !isMobile && tooltipPosition && (
        <Portal>
          <div
            className="fixed w-80 max-w-[calc(100vw-2rem)] p-4 bg-dark-blue/95 backdrop-blur-sm border border-gold/30 rounded-lg shadow-lg animate-tooltip-fade-in z-50 pointer-events-none"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: 'translate(-50%, -100%)',
            }}
            role="tooltip"
          >
            <div
              className="ability-description text-base leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: sanitisedDescription }}
            />
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-dark-blue/95" />
          </div>
        </Portal>
      )}
    </div>
  )
}
