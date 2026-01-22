# Interactive Icon Wall Background

## Overview

An ambient, interactive background of League ability/champion icons that scroll across the home page in multiple directions. Icons react to mouse hover with subtle wiggles and scale effects, creating a living, breathing backdrop that celebrates the game's visual identity without overwhelming the main content.

**Scope:** Home page only
**Dependencies:** Existing ability icon URLs from database, Framer Motion

---

## Progress Tracker

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | ✅ Done | Data layer — fetch icon URLs |
| 1 | ✅ Done | Basic marquee rows |
| 2 | ✅ Done | Multi-direction scrolling |
| 3 | ✅ Done | Parallax depth layers |
| 4 | ✅ Done | Hover interactions |
| 5 | ✅ Done | Mobile adaptation |
| 6 | 🔄 In Progress | Performance & accessibility — needs visual testing |

### Implementation Notes (2026-01-22)

**Completed:**
- Created `src/lib/data/champion-icons.ts` with 45 champion icon paths + shuffle/chunk utilities
- Added CSS keyframes `icon-scroll-left` and `icon-scroll-right` to `globals.css`
- Built unified `src/components/home/IconWall.tsx` containing:
  - `IconWallIcon` — individual icon with Framer Motion hover (wiggle + scale + desaturate)
  - `IconWallRow` — single marquee row with neighbor ripple effect
  - `IconWallLayer` — groups rows with alternating directions
  - `IconWall` — main component with 3 parallax layers (desktop) or 1 simplified layer (mobile)
- Integrated into `src/app/page.tsx`
- Respects `prefers-reduced-motion`

**Awaiting feedback:**
- Visual weight (opacity levels: back 6%, middle 10%, front 14%)
- Animation speed (65-100 seconds per cycle)
- Icon sizes (32px/48px/56px for depth layers)
- Hover interaction feel (wiggle + 1.2x scale, neighbors 1.08x)

---

## Design Decisions

### Visual Treatment
- **Monochrome at 10-15% opacity** — Icons are texture, not content
- Desaturated with CSS `filter: grayscale(100%) opacity(0.12)`
- Gold accent color preserved in main UI remains the focal point

### Depth & Parallax
- **3 layers** moving at different speeds:
  - Back layer: Smallest icons (32px), slowest, dimmest (8% opacity)
  - Middle layer: Medium icons (48px), medium speed (12% opacity)
  - Front layer: Largest icons (64px), fastest, brightest (15% opacity)

### Movement
- **Multi-directional rows:**
  - Odd rows scroll left → right
  - Even rows scroll right → left
- **Speed:** Very slow/ambient (60-90 second full cycle)
- Seamless infinite loop via duplicated icon sets

### Hover Interaction
- **Primary icon:** Subtle wiggle (±3° rotation) + scale up (1.15x)
- **Ripple effect:** Adjacent icons respond with dampened effect (scale 1.05x)
- **Transition:** Spring physics for organic feel
- **Desktop only** — touch devices skip hover states

### Mobile Adaptation
- Reduce to **single layer** (middle layer only)
- **Slower animation** (120 second cycle)
- **No hover interactions** (no hover on touch)
- Consider **disabling entirely** on low-end devices
- Respect `prefers-reduced-motion`

---

## Technical Architecture

### Component Structure

```
src/components/home/
├── IconWall.tsx           # Main container, orchestrates layers
├── IconWallLayer.tsx      # Single scrolling layer
├── IconWallRow.tsx        # Single row of icons (marquee)
└── IconWallIcon.tsx       # Individual icon with hover effects
```

### Data Flow

```
1. IconWall mounts
2. Fetch ability icons from /api/icons (or static import)
3. Shuffle and distribute across layers/rows
4. Each row renders 2x icons (for seamless loop)
5. CSS animation handles scrolling
6. Framer Motion handles hover interactions
```

---

## Implementation Phases

### Phase 0: Data Layer

**Goal:** Get ability icon URLs available for the component

**Option A: API endpoint**
```typescript
// src/app/api/icons/route.ts
export async function GET() {
  const abilities = await prisma.ability.findMany({
    select: { iconUrl: true },
    take: 100, // Enough for variety
  })
  return Response.json(abilities.map(a => a.iconUrl))
}
```

**Option B: Static import at build time**
```typescript
// src/lib/data/icons.ts
export const ABILITY_ICONS: string[] = [
  // Pre-compiled list of CDragon URLs
]
```

**Recommendation:** Option B for performance (no runtime fetch), generated during build/seed.

**Files:**
- `src/lib/data/icons.ts` — Static icon URL array
- Update `src/scripts/seed.ts` — Generate icons file during seeding

---

### Phase 1: Basic Marquee Row

**Goal:** Single row of icons scrolling horizontally

**New Component:** `src/components/home/IconWallRow.tsx`

```tsx
"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"

interface IconWallRowProps {
  icons: string[]
  direction: "left" | "right"
  duration: number // seconds
  size: number // px
  opacity: number // 0-1
}

export function IconWallRow({ icons, direction, duration, size, opacity }: IconWallRowProps) {
  // Duplicate icons for seamless loop
  const allIcons = [...icons, ...icons]

  return (
    <div className="overflow-hidden">
      <div
        className={cn(
          "flex gap-4",
          direction === "left" ? "animate-scroll-left" : "animate-scroll-right"
        )}
        style={{
          animationDuration: `${duration}s`,
          opacity,
        }}
      >
        {allIcons.map((url, i) => (
          <div
            key={i}
            className="flex-shrink-0"
            style={{ width: size, height: size }}
          >
            <Image
              src={url}
              alt=""
              width={size}
              height={size}
              className="grayscale"
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**CSS Keyframes:** `src/app/globals.css`

```css
@keyframes scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes scroll-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

.animate-scroll-left {
  animation: scroll-left linear infinite;
}

.animate-scroll-right {
  animation: scroll-right linear infinite;
}
```

---

### Phase 2: Multi-Direction Scrolling

**Goal:** Multiple rows scrolling in alternating directions

**New Component:** `src/components/home/IconWallLayer.tsx`

```tsx
interface IconWallLayerProps {
  icons: string[]
  rowCount: number
  size: number
  opacity: number
  baseDuration: number
  className?: string
}

export function IconWallLayer({
  icons,
  rowCount,
  size,
  opacity,
  baseDuration,
  className
}: IconWallLayerProps) {
  // Shuffle and chunk icons into rows
  const shuffled = useMemo(() => shuffle(icons), [icons])
  const iconsPerRow = Math.ceil(shuffled.length / rowCount)
  const rows = chunk(shuffled, iconsPerRow)

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {rows.map((rowIcons, i) => (
        <IconWallRow
          key={i}
          icons={rowIcons}
          direction={i % 2 === 0 ? "left" : "right"}
          duration={baseDuration + (i * 5)} // Slight variation
          size={size}
          opacity={opacity}
        />
      ))}
    </div>
  )
}
```

---

### Phase 3: Parallax Depth Layers

**Goal:** 3 layers at different depths creating sense of space

**Main Component:** `src/components/home/IconWall.tsx`

```tsx
"use client"

import { IconWallLayer } from "./IconWallLayer"
import { ABILITY_ICONS } from "@/lib/data/icons"
import { useReducedMotion } from "@/lib/motion"

const LAYER_CONFIG = {
  back: { size: 32, opacity: 0.08, duration: 90, rows: 4 },
  middle: { size: 48, opacity: 0.12, duration: 75, rows: 3 },
  front: { size: 64, opacity: 0.15, duration: 60, rows: 2 },
}

export function IconWall() {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) return null

  // Split icons across layers
  const [backIcons, middleIcons, frontIcons] = useMemo(() => {
    const shuffled = shuffle(ABILITY_ICONS)
    const third = Math.ceil(shuffled.length / 3)
    return [
      shuffled.slice(0, third),
      shuffled.slice(third, third * 2),
      shuffled.slice(third * 2),
    ]
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Back layer */}
      <IconWallLayer
        icons={backIcons}
        {...LAYER_CONFIG.back}
        className="absolute inset-0"
      />

      {/* Middle layer */}
      <IconWallLayer
        icons={middleIcons}
        {...LAYER_CONFIG.middle}
        className="absolute inset-0 top-8"
      />

      {/* Front layer */}
      <IconWallLayer
        icons={frontIcons}
        {...LAYER_CONFIG.front}
        className="absolute inset-0 top-16"
      />
    </div>
  )
}
```

---

### Phase 4: Hover Interactions

**Goal:** Icons wiggle and scale on hover, with ripple to neighbors

**Enhanced Component:** `src/components/home/IconWallIcon.tsx`

```tsx
"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useCallback } from "react"

interface IconWallIconProps {
  url: string
  size: number
  onHoverStart?: () => void
  onHoverEnd?: () => void
  isNeighborHovered?: boolean
}

const wiggle = {
  rotate: [0, -3, 3, -2, 2, 0],
  transition: { duration: 0.5, ease: "easeInOut" }
}

export function IconWallIcon({
  url,
  size,
  onHoverStart,
  onHoverEnd,
  isNeighborHovered
}: IconWallIconProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="flex-shrink-0 cursor-default"
      style={{ width: size, height: size }}
      onHoverStart={() => {
        setIsHovered(true)
        onHoverStart?.()
      }}
      onHoverEnd={() => {
        setIsHovered(false)
        onHoverEnd?.()
      }}
      animate={{
        scale: isHovered ? 1.15 : isNeighborHovered ? 1.05 : 1,
        rotate: isHovered ? wiggle.rotate : 0,
        filter: isHovered
          ? "grayscale(0%) opacity(0.8)"
          : "grayscale(100%) opacity(0.12)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        aria-hidden="true"
        draggable={false}
      />
    </motion.div>
  )
}
```

**Ripple Implementation:**

The row component tracks hovered index and passes `isNeighborHovered` to adjacent icons:

```tsx
const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

// In render:
{icons.map((url, i) => (
  <IconWallIcon
    key={i}
    url={url}
    size={size}
    onHoverStart={() => setHoveredIndex(i)}
    onHoverEnd={() => setHoveredIndex(null)}
    isNeighborHovered={
      hoveredIndex !== null &&
      Math.abs(hoveredIndex - i) === 1
    }
  />
))}
```

---

### Phase 5: Mobile Adaptation

**Goal:** Graceful degradation on mobile devices

**Changes to `IconWall.tsx`:**

```tsx
import { useMediaQuery } from "@/lib/hooks/useMediaQuery"

export function IconWall() {
  const reducedMotion = useReducedMotion()
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (reducedMotion) return null

  // Mobile: single layer, slower, no hover
  if (isMobile) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <IconWallLayer
          icons={ABILITY_ICONS.slice(0, 30)}
          size={40}
          opacity={0.08}
          duration={120}
          rows={4}
          disableHover
        />
      </div>
    )
  }

  // Desktop: full experience
  return (/* ... */)
}
```

**Disable hover on touch:**

```tsx
// IconWallIcon.tsx
const isTouch = useMediaQuery("(hover: none)")

// Skip hover handlers if touch device
onHoverStart={isTouch ? undefined : () => {...}}
```

---

### Phase 6: Performance & Accessibility

**Goal:** Smooth 60fps, respects user preferences

#### Performance Optimizations

1. **GPU acceleration:**
   ```css
   .icon-wall-row {
     will-change: transform;
     transform: translateZ(0);
   }
   ```

2. **Image optimization:**
   ```tsx
   <Image
     src={url}
     width={size}
     height={size}
     loading="lazy"
     priority={false}
   />
   ```

3. **Reduce icons on scroll:**
   ```tsx
   // Pause animation when not visible
   const isVisible = useIntersectionObserver(ref)
   style={{ animationPlayState: isVisible ? "running" : "paused" }}
   ```

#### Accessibility

1. **Reduced motion:**
   ```tsx
   const reducedMotion = useReducedMotion()
   if (reducedMotion) return null // Or static version
   ```

2. **Semantic HTML:**
   ```tsx
   <div role="presentation" aria-hidden="true">
   ```

3. **No focus traps:**
   ```tsx
   tabIndex={-1}
   ```

---

## Files Summary

### New Files (Created)

| File | Purpose | Status |
|------|---------|--------|
| `src/components/home/IconWall.tsx` | All-in-one component (Icon, Row, Layer, Wall) | ✅ Created |
| `src/lib/data/champion-icons.ts` | Static array of champion icon URLs + utilities | ✅ Created |

### Modified Files (Updated)

| File | Changes | Status |
|------|---------|--------|
| `src/app/globals.css` | Added `icon-scroll-left/right` keyframes + utilities | ✅ Done |
| `src/app/page.tsx` | Added `<IconWall />` component | ✅ Done |

### Future Enhancements

| File | Changes | Status |
|------|---------|--------|
| `src/scripts/seed.ts` | Auto-generate champion-icons.ts during seed | ⬜ Nice-to-have |

---

## Testing Checklist

### Visual Quality
- [ ] Icons feel like texture, not competing content
- [ ] Parallax depth is noticeable but subtle
- [ ] Hover interactions feel organic/playful
- [ ] Ripple effect doesn't distract
- [ ] Gold UI remains focal point

### Performance
- [ ] 60fps on desktop Chrome/Safari/Firefox
- [ ] 60fps on mobile Safari
- [ ] No jank during hover interactions
- [ ] Lazy loading prevents initial load impact
- [ ] Memory usage stable (no leaks)

### Accessibility
- [ ] Respects `prefers-reduced-motion`
- [ ] No keyboard focus traps
- [ ] Screen readers ignore background
- [ ] No seizure-inducing patterns

### Mobile
- [ ] Single layer only on mobile
- [ ] No hover states on touch devices
- [ ] Slower animation speed
- [ ] Acceptable performance on mid-range devices

---

## Success Criteria

1. **Adds personality** — Background feels alive and on-brand
2. **Doesn't overwhelm** — Main UI remains the focus
3. **Delightful hover** — Users discover and enjoy the interaction
4. **Performs well** — No dropped frames, fast initial load
5. **Accessible** — Works for all users regardless of preferences
6. **Mobile-appropriate** — Graceful degradation, not broken

---

## References

### Inspiration
- [Motion Ticker Component](https://motion.dev/docs/react-ticker)
- [Smashing Magazine CSS Marquee](https://www.smashingmagazine.com/2024/04/infinite-scrolling-logos-html-css/)
- [Ryan Mulligan's CSS Marquee Logo Wall](https://codepen.io/hexagoncircle/pen/wvmjomb)
- [Tailwind + Framer Motion Logos](https://ayushgandhi.com/blog/infinite-scrolling-logos)
- [Awwwards Parallax Sites](https://www.awwwards.com/websites/parallax/)

### Internal
- Animation system: `src/lib/motion/`
- Media queries: `src/lib/hooks/useMediaQuery.ts`
- Image config: `next.config.ts` (CDragon remote patterns)

---

## Open Questions

1. **Champion vs Ability icons?** Abilities have more variety (600+), champions are more recognizable (~170)
2. **Should icons link anywhere on click?** Currently no — keeps it as pure background
3. **Seasonal themes?** Could swap icon sets for events (Worlds, holidays)
