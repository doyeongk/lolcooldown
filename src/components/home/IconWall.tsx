"use client"

import { useMemo, useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/motion"
import { useIsMobile } from "@/lib/hooks/useMediaQuery"
import { CHAMPION_SPLASHES } from "@/lib/data/champion-splashes"
import { shuffleArray } from "@/lib/data/champion-icons"

// Splash art dimensions (1.7:1 aspect ratio) - large for cinematic feel
const SPLASH_SIZE = {
  mobile: { width: 200, height: 118 },
  desktop: { width: 360, height: 212 },
}

const GAP = 6 // Tight gaps for gallery feel

// Row speeds in seconds - slow and uniform for calm background
const ROW_SPEEDS = [140, 155, 145, 160, 150, 165, 148, 158]

// Depth tiers: edge rows are "further away" (dimmer), center rows are "closer" (brighter)
const ROW_BRIGHTNESS = [0.28, 0.33, 0.40, 0.45, 0.45, 0.40, 0.33, 0.28]

// All same direction - alternating was too distracting
const ROW_REVERSE = [false, false, false, false, false, false, false, false]

interface SplashTileProps {
  src: string
  size: { width: number; height: number }
}

function SplashTile({ src, size }: SplashTileProps) {
  return (
    <div
      className="flex-shrink-0 border-2 border-black/80 ring-1 ring-gold/20"
      style={{
        width: size.width,
        height: size.height,
      }}
    >
      <Image
        src={src}
        alt=""
        width={size.width}
        height={size.height}
        className="object-cover w-full h-full"
        aria-hidden="true"
        draggable={false}
      />
    </div>
  )
}

interface SplashRowProps {
  splashes: string[]
  speed: number
  offset: boolean
  size: { width: number; height: number }
  disableAnimation: boolean
  rowIndex: number
  reverse: boolean
  brightness: number
}

function SplashRow({ splashes, speed, offset, size, disableAnimation, rowIndex, reverse, brightness }: SplashRowProps) {
  // Triple the splashes for seamless infinite scroll
  const tripleSplashes = useMemo(() => [...splashes, ...splashes, ...splashes], [splashes])

  // Calculate total row width for animation (use base size for consistency)
  const rowWidth = splashes.length * (size.width + GAP)

  // Non-uniform stagger delays for organic feel
  const staggerDelays = [-15, -42, -8, -67, -25, -89, -31, -53]

  return (
    <div
      className="flex items-center"
      style={{
        gap: `${GAP}px`,
        // Brick pattern offset: shift every other row by half a tile
        marginLeft: offset ? `${(size.width + GAP) / 2}px` : 0,
        // Per-row brightness for depth
        filter: `brightness(${brightness})`,
      }}
    >
      <div
        className={cn(
          "flex items-center",
          !disableAnimation && "animate-icon-row-scroll"
        )}
        style={{
          gap: `${GAP}px`,
          // CSS custom properties for animation
          "--row-width": `${rowWidth}px`,
          "--row-speed": `${speed}s`,
          // Stagger start positions with non-uniform delays
          animationDelay: `${staggerDelays[rowIndex % staggerDelays.length]}s`,
          // Alternate direction for organic feel
          animationDirection: reverse ? "reverse" : "normal",
        } as React.CSSProperties}
      >
        {tripleSplashes.map((src, i) => (
          <SplashTile
            key={`${src}-${i}`}
            src={src}
            size={size}
          />
        ))}
      </div>
    </div>
  )
}

export function IconWall() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine splash size based on viewport
  const splashSize = isMobile ? SPLASH_SIZE.mobile : SPLASH_SIZE.desktop

  // Calculate how many rows we need to fill the viewport
  const rowCount = 8

  // Shuffle and distribute splashes across rows
  const rowData = useMemo(() => {
    const shuffled = shuffleArray(CHAMPION_SPLASHES)
    // Roughly 12-15 splashes per row to ensure we fill width + extra for loop
    const splashesPerRow = 15
    const rows: string[][] = []

    for (let i = 0; i < rowCount; i++) {
      const rowSplashes: string[] = []
      for (let j = 0; j < splashesPerRow; j++) {
        // Cycle through shuffled splashes
        rowSplashes.push(shuffled[(i * splashesPerRow + j) % shuffled.length])
      }
      rows.push(rowSplashes)
    }

    return rows
  }, [rowCount])

  if (!mounted) {
    return null
  }

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      role="presentation"
      aria-hidden="true"
    >
      {/* Icon grid container */}
      <div
        className="absolute inset-0 flex flex-col justify-center"
        style={{
          gap: `${GAP}px`,
          // Extend beyond viewport edges for seamless effect
          marginLeft: "-5%",
          marginRight: "-5%",
          width: "110%",
          // Base saturation reduction (brightness now per-row)
          filter: "saturate(0.7)",
        }}
      >
        {rowData.map((splashes, i) => (
          <SplashRow
            key={i}
            splashes={splashes}
            speed={ROW_SPEEDS[i % ROW_SPEEDS.length]}
            offset={i % 2 === 1} // Brick pattern
            size={splashSize}
            disableAnimation={reducedMotion ?? false}
            rowIndex={i}
            reverse={ROW_REVERSE[i % ROW_REVERSE.length]}
            brightness={ROW_BRIGHTNESS[i % ROW_BRIGHTNESS.length]}
          />
        ))}
      </div>

      {/* Blur vignette - creates depth-of-field effect (sharp center, blurred edges) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          maskImage: "radial-gradient(ellipse 70% 60% at center, transparent 0%, black 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at center, transparent 0%, black 70%)",
        }}
      />

      {/* Atmospheric haze - adds distance/fog between bg and content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 70% at center, rgba(15, 13, 10, 0.15) 0%, rgba(15, 13, 10, 0.5) 100%)",
        }}
      />

      {/* Radial vignette - cinematic darkening toward edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 85% 75% at center, transparent 20%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.85) 100%)",
        }}
      />
    </div>
  )
}
