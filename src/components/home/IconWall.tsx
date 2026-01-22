"use client"

import { useMemo, useState, useCallback } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/motion"
import { useIsMobile } from "@/lib/hooks/useMediaQuery"
import { CHAMPION_ICONS, shuffleArray, chunkArray } from "@/lib/data/champion-icons"

// Layer configuration type
interface LayerConfig {
  size: number
  opacity: number
  duration: number
  rows: number
  gap: number
}

// Layer configuration for parallax depth effect
const LAYER_CONFIG: Record<"back" | "middle" | "front", LayerConfig> = {
  back: { size: 32, opacity: 0.06, duration: 100, rows: 3, gap: 16 },
  middle: { size: 48, opacity: 0.1, duration: 80, rows: 3, gap: 20 },
  front: { size: 56, opacity: 0.14, duration: 65, rows: 2, gap: 24 },
}

// Mobile uses single simplified layer
const MOBILE_CONFIG: LayerConfig = { size: 40, opacity: 0.06, duration: 120, rows: 4, gap: 16 }

interface IconWallIconProps {
  src: string
  size: number
  index: number
  hoveredIndex: number | null
  onHoverStart: () => void
  onHoverEnd: () => void
  disableHover?: boolean
}

function IconWallIcon({
  src,
  size,
  index,
  hoveredIndex,
  onHoverStart,
  onHoverEnd,
  disableHover,
}: IconWallIconProps) {
  const isHovered = hoveredIndex === index
  const isNeighbor =
    hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1

  if (disableHover) {
    return (
      <div
        className="flex-shrink-0 rounded-md overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          className="grayscale"
          aria-hidden="true"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <motion.div
      className="flex-shrink-0 rounded-md overflow-hidden cursor-default"
      style={{ width: size, height: size }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      animate={{
        scale: isHovered ? 1.2 : isNeighbor ? 1.08 : 1,
        rotate: isHovered ? [0, -3, 3, -2, 2, 0] : 0,
        filter: isHovered
          ? "grayscale(0%) brightness(1.1)"
          : "grayscale(100%) brightness(1)",
      }}
      transition={{
        scale: { type: "spring", stiffness: 300, damping: 20 },
        rotate: { duration: 0.5, ease: "easeInOut" },
        filter: { duration: 0.2 },
      }}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="grayscale"
        aria-hidden="true"
        draggable={false}
      />
    </motion.div>
  )
}

interface IconWallRowProps {
  icons: string[]
  direction: "left" | "right"
  duration: number
  size: number
  gap: number
  disableHover?: boolean
}

function IconWallRow({
  icons,
  direction,
  duration,
  size,
  gap,
  disableHover,
}: IconWallRowProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Duplicate icons for seamless loop
  const allIcons = useMemo(() => [...icons, ...icons], [icons])

  const handleHoverStart = useCallback((index: number) => {
    setHoveredIndex(index)
  }, [])

  const handleHoverEnd = useCallback(() => {
    setHoveredIndex(null)
  }, [])

  return (
    <div className="overflow-hidden">
      <div
        className={cn(
          "flex",
          direction === "left"
            ? "animate-icon-scroll-left"
            : "animate-icon-scroll-right"
        )}
        style={{
          animationDuration: `${duration}s`,
          gap: `${gap}px`,
        }}
      >
        {allIcons.map((src, i) => (
          <IconWallIcon
            key={`${src}-${i}`}
            src={src}
            size={size}
            index={i}
            hoveredIndex={hoveredIndex}
            onHoverStart={() => handleHoverStart(i)}
            onHoverEnd={handleHoverEnd}
            disableHover={disableHover}
          />
        ))}
      </div>
    </div>
  )
}

interface IconWallLayerProps {
  icons: string[]
  config: LayerConfig
  className?: string
  disableHover?: boolean
}

function IconWallLayer({
  icons,
  config,
  className,
  disableHover,
}: IconWallLayerProps) {
  const { size, duration, rows, gap } = config

  // Shuffle and chunk icons into rows
  const rowData = useMemo(() => {
    const shuffled = shuffleArray(icons)
    const iconsPerRow = Math.ceil(shuffled.length / rows)
    return chunkArray(shuffled, iconsPerRow)
  }, [icons, rows])

  return (
    <div className={cn("flex flex-col justify-around h-full", className)} style={{ gap: `${gap}px` }}>
      {rowData.map((rowIcons, i) => (
        <IconWallRow
          key={i}
          icons={rowIcons}
          direction={i % 2 === 0 ? "left" : "right"}
          duration={duration + i * 8}
          size={size}
          gap={gap}
          disableHover={disableHover}
        />
      ))}
    </div>
  )
}

export function IconWall() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  // Don't render if user prefers reduced motion
  if (reducedMotion) return null

  // Split icons across layers (desktop) or use all for mobile
  const [backIcons, middleIcons, frontIcons] = useMemo(() => {
    const shuffled = shuffleArray(CHAMPION_ICONS)
    const third = Math.ceil(shuffled.length / 3)
    return [
      shuffled.slice(0, third),
      shuffled.slice(third, third * 2),
      shuffled.slice(third * 2),
    ]
  }, [])

  // Mobile: simplified single layer
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        role="presentation"
        aria-hidden="true"
      >
        <div style={{ opacity: MOBILE_CONFIG.opacity }} className="h-full">
          <IconWallLayer
            icons={CHAMPION_ICONS.slice(0, 30)}
            config={MOBILE_CONFIG}
            disableHover
          />
        </div>
      </div>
    )
  }

  // Desktop: three parallax layers
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-auto"
      role="presentation"
      aria-hidden="true"
    >
      {/* Back layer - smallest, slowest, dimmest */}
      <div
        className="absolute inset-0"
        style={{ opacity: LAYER_CONFIG.back.opacity }}
      >
        <IconWallLayer icons={backIcons} config={LAYER_CONFIG.back} />
      </div>

      {/* Middle layer */}
      <div
        className="absolute inset-0 top-6"
        style={{ opacity: LAYER_CONFIG.middle.opacity }}
      >
        <IconWallLayer icons={middleIcons} config={LAYER_CONFIG.middle} />
      </div>

      {/* Front layer - largest, fastest, brightest */}
      <div
        className="absolute inset-0 top-12"
        style={{ opacity: LAYER_CONFIG.front.opacity }}
      >
        <IconWallLayer icons={frontIcons} config={LAYER_CONFIG.front} />
      </div>
    </div>
  )
}
