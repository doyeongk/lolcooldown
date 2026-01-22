# Frontend Migration: shadcn/ui + Framer Motion

## Overview

Migrate the lolcooldown frontend from custom CSS animations and bespoke UI components to a standardized stack using **shadcn/ui** for UI primitives and **Framer Motion** for animations. This creates a reusable, composable component library ready for future game modes.

**Goals:**
- Reduce custom code, increase maintainability
- Standardize UI patterns with shadcn/ui
- Declarative, easier-to-work-with animations via Framer Motion
- Light visual refresh while preserving game identity
- Prepare architecture for future game modes

**Stack:**
- shadcn/ui (Radix primitives + Tailwind)
- Framer Motion (motion package)
- Existing: Next.js 16, React 19, Tailwind CSS, Prisma

---

## Phase 1: Foundation Setup

### 1.1 Install Dependencies

```bash
# shadcn/ui initialization
npx shadcn@latest init

# Framer Motion (now called "motion")
npm install motion
```

### 1.2 Configure shadcn/ui

**File:** `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### 1.3 Extend Theme with Game Colors

**File:** `src/app/globals.css` - Add shadcn CSS variables alongside existing game tokens:

```css
@layer base {
  :root {
    /* Existing game tokens (keep) */
    --gold: #e3cf74;
    --gold-hover: #d4c066;
    --dark-blue: #172b3b;
    --dark-blue-hover: #1e3a4a;

    /* shadcn tokens mapped to game theme */
    --background: 222 47% 16%;      /* dark-blue */
    --foreground: 220 14% 91%;      /* foreground text */
    --primary: 47 66% 67%;          /* gold */
    --primary-foreground: 222 47% 16%;
    --secondary: 222 47% 20%;
    --secondary-foreground: 220 14% 91%;
    --accent: 47 66% 67%;
    --accent-foreground: 222 47% 16%;
    --destructive: 0 84% 60%;
    --border: 47 66% 67% / 0.3;
    --ring: 47 66% 67%;
  }
}
```

### 1.4 Create Framer Motion Presets

**File:** `src/lib/motion.ts`

```typescript
import { Variants, Transition } from 'motion/react'

// Shared transitions
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

export const easeTransition: Transition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1],
}

// Panel variants
export const panelVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

// Slide variants for carousel
export const slideLeftVariants: Variants = {
  enter: { x: '100%', opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
}

export const slideUpVariants: Variants = {
  enter: { y: '100%', opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: '-100%', opacity: 0 },
}

// Button feedback
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

// Score pop
export const scorePopVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 1.2, opacity: 0 },
}

// Reduced motion variants (instant)
export const reducedMotionVariants: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}
```

### 1.5 Create useReducedMotion Hook Wrapper

**File:** `src/lib/hooks/useMotion.ts`

```typescript
'use client'

import { useReducedMotion } from 'motion/react'
import * as presets from '@/lib/motion'

export function useMotionPresets() {
  const shouldReduceMotion = useReducedMotion()

  return {
    shouldReduceMotion,
    variants: shouldReduceMotion
      ? presets.reducedMotionVariants
      : presets.panelVariants,
    transition: shouldReduceMotion
      ? { duration: 0 }
      : presets.easeTransition,
  }
}
```

**Acceptance Criteria:**
- [ ] `npx shadcn@latest init` completes successfully
- [ ] `motion` package installed
- [ ] CSS variables render correct colors in browser DevTools
- [ ] Motion presets export without TypeScript errors

---

## Phase 2: UI Component Migration

### 2.1 Button Component

**Current:** `src/components/ui/Button.tsx` (48 lines, custom)
**Target:** shadcn Button with game variants

```bash
npx shadcn@latest add button
```

**File:** `src/components/ui/button.tsx` (shadcn generates this)

Extend `buttonVariants` in the generated file:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Game-specific variants
        gold: "bg-gold text-dark-blue hover:bg-gold-hover font-semibold",
        darkBlue: "bg-dark-blue text-foreground hover:bg-dark-blue-hover border border-gold/30",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8 text-lg",
        xl: "h-14 px-10 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**Migration Steps:**
1. Install shadcn button
2. Add `gold` and `darkBlue` variants
3. Update imports across codebase: `@/components/ui/Button` → `@/components/ui/button`
4. Replace `LinkButton` usage with `<Button asChild><Link href="...">...</Link></Button>`
5. Delete old `Button.tsx` and `LinkButton.tsx`

**Files to Update:**
- `src/app/page.tsx` - Home page buttons
- `src/components/game/GameOver.tsx` - Modal buttons
- `src/components/game/GuessButtons.tsx` - Guess buttons

**Acceptance Criteria:**
- [ ] All button variants render correctly
- [ ] Focus ring uses gold color
- [ ] Disabled state shows 50% opacity
- [ ] `asChild` works with Next.js Link
- [ ] No visual regression on home page or game over screen

---

### 2.2 Dialog Component (GameOver Modal)

**Current:** `src/components/game/GameOver.tsx` (47 lines, custom overlay)
**Target:** shadcn Dialog with Framer Motion

```bash
npx shadcn@latest add dialog
```

**File:** `src/components/game/GameOver.tsx` (migrated)

```typescript
'use client'

import { motion, AnimatePresence } from 'motion/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface GameOverProps {
  open: boolean
  score: number
  highScore: number
  isNewHighScore: boolean
  onRestart: () => void
}

export function GameOver({ open, score, highScore, isNewHighScore, onRestart }: GameOverProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <AnimatePresence>
        {open && (
          <DialogContent
            className="sm:max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl text-center">Game Over</DialogTitle>
                <DialogDescription className="text-center">
                  {isNewHighScore && (
                    <motion.span
                      className="block text-gold font-bold text-lg mb-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: 2, duration: 0.5 }}
                    >
                      New High Score!
                    </motion.span>
                  )}
                  <span className="block text-4xl font-bold my-4">{score}</span>
                  <span className="text-muted-foreground">High Score: {highScore}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3 mt-6">
                <Button variant="gold" size="lg" onClick={onRestart}>
                  Try Again
                </Button>
                <Button variant="darkBlue" size="lg" asChild>
                  <Link href="/">Back to Menu</Link>
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
```

**Acceptance Criteria:**
- [ ] Modal opens when `open={true}`
- [ ] Modal cannot be dismissed by backdrop click
- [ ] Modal cannot be dismissed by Escape key
- [ ] "New High Score!" text pulses when applicable
- [ ] Buttons have correct focus order (Try Again → Back to Menu)
- [ ] Entrance animation is smooth 300ms fade+scale

---

### 2.3 Tooltip + Drawer (AbilityIcon)

**Current:** `src/components/game/AbilityIcon.tsx` (182 lines, custom tooltip/bottom sheet)
**Target:** shadcn Tooltip (desktop) + Drawer (mobile)

```bash
npx shadcn@latest add tooltip drawer
```

**File:** `src/components/game/AbilityIcon.tsx` (migrated)

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { sanitizeHtml } from '@/lib/utils/sanitize'

interface AbilityIconProps {
  name: string
  description: string
  iconUrl: string
  championName: string
}

export function AbilityIcon({ name, description, iconUrl, championName }: AbilityIconProps) {
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Note: sanitizeHtml uses DOMPurify to sanitize ability descriptions
  // from Community Dragon data before rendering
  const sanitizedDescription = description ? sanitizeHtml(description) : ''

  const content = (
    <div className="space-y-2">
      <p className="font-semibold text-gold">{championName}</p>
      <p className="font-medium">{name}</p>
      {sanitizedDescription && (
        <div
          className="text-sm text-muted-foreground ability-description"
          // Content is sanitized with DOMPurify before rendering
          // See src/lib/utils/sanitize.ts for sanitization config
        >
          {/* Render sanitized HTML for ability tooltips */}
        </div>
      )}
    </div>
  )

  // Mobile: Drawer
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setDrawerOpen(true)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg"
        >
          <Image src={iconUrl} alt={name} width={64} height={64} className="rounded-lg" />
        </button>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[70vh]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-3">
                <Image src={iconUrl} alt={name} width={48} height={48} className="rounded" />
                {name}
              </DrawerTitle>
              <DrawerDescription asChild>
                <div className="text-left">{content}</div>
              </DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  // Desktop: Tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg">
            <Image src={iconUrl} alt={name} width={64} height={64} className="rounded-lg" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

**Note:** The existing `sanitizeHtml` utility in `src/lib/utils/sanitize.ts` uses DOMPurify to safely sanitize ability descriptions from Community Dragon before rendering. This pattern is already established in the codebase.

**Acceptance Criteria:**
- [ ] Desktop: Tooltip appears on hover
- [ ] Desktop: Tooltip positioned above icon
- [ ] Mobile: Drawer opens on tap
- [ ] Mobile: Drawer has sticky header with ability icon
- [ ] Mobile: Drawer dismisses on backdrop tap
- [ ] Both: HTML descriptions render safely (sanitized with DOMPurify)
- [ ] Both: Escape key dismisses
- [ ] No hydration mismatch on initial load

---

### 2.4 Delete Unused Components

After Phase 2 completion:

```bash
rm src/components/ui/Button.tsx
rm src/components/ui/LinkButton.tsx
rm src/components/ui/Portal.tsx
```

**Acceptance Criteria:**
- [ ] No import errors after deletion
- [ ] Build passes: `npm run build`

---

## Phase 3: Animation System Migration

### 3.1 SplitPanel Animations

**Current:** 12 CSS animation classes, complex state-based class switching
**Target:** Framer Motion variants with `AnimatePresence`

**File:** `src/components/game/SplitPanel.tsx` (migrated)

```typescript
'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { useMotionPresets } from '@/lib/hooks/useMotion'
import { AbilityIcon } from './AbilityIcon'
import type { GameAbility } from '@/types/game'

interface SplitPanelProps {
  ability: GameAbility
  side: 'left' | 'right'
  showCooldown: boolean
  isCorrect: boolean | null
  skipAnimation?: boolean
}

const slideVariants = {
  left: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  right: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
}

const cooldownVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 15 }
  },
}

export function SplitPanel({
  ability,
  side,
  showCooldown,
  isCorrect,
  skipAnimation = false
}: SplitPanelProps) {
  const { shouldReduceMotion } = useMotionPresets()

  const variants = shouldReduceMotion || skipAnimation
    ? { initial: {}, animate: {}, exit: {} }
    : slideVariants[side]

  return (
    <motion.div
      className="relative flex-1 flex flex-col items-center justify-center"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        // GPU acceleration for iOS Safari
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={ability.ability.champion.splashUrl}
          alt={ability.ability.champion.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <AbilityIcon
          name={ability.ability.name}
          description={ability.ability.description}
          iconUrl={ability.ability.iconUrl}
          championName={ability.ability.champion.name}
        />

        <p className="text-lg md:text-xl font-medium text-center">
          {ability.ability.champion.name}
        </p>
        <p className="text-sm text-foreground/70">
          {ability.ability.name} (Rank {ability.level})
        </p>

        {/* Cooldown reveal */}
        <motion.div
          variants={cooldownVariants}
          initial="hidden"
          animate={showCooldown ? 'visible' : 'hidden'}
          className="text-4xl md:text-5xl font-bold text-gold"
        >
          {ability.cooldown}s
        </motion.div>
      </div>

      {/* Correct/Incorrect overlay */}
      {isCorrect !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 ${
            isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
        />
      )}
    </motion.div>
  )
}
```

**Acceptance Criteria:**
- [ ] Panels slide in from correct sides on initial load
- [ ] Panels animate out/in during transitions
- [ ] Cooldown number "pops" when revealed
- [ ] Correct/incorrect overlay fades in
- [ ] No flicker on iOS Safari
- [ ] `skipAnimation` prop bypasses animations
- [ ] Reduced motion users see instant transitions

---

### 3.2 Mobile Panel Carousel (TikTok-style vertical)

**File:** `src/components/game/MobilePanelCarousel.tsx` (new)

```typescript
'use client'

import { motion, AnimatePresence } from 'motion/react'
import { SplitPanel } from './SplitPanel'
import type { GameRound } from '@/types/game'

interface MobilePanelCarouselProps {
  currentRound: GameRound
  nextRound: GameRound | null
  phase: 'playing' | 'revealing' | 'transitioning'
  showCooldown: boolean
  lastGuessCorrect: boolean | null
}

const mobileVariants = {
  enter: { y: '100%', opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: '-100%', opacity: 0 },
}

export function MobilePanelCarousel({
  currentRound,
  nextRound,
  phase,
  showCooldown,
  lastGuessCorrect,
}: MobilePanelCarouselProps) {
  const isTransitioning = phase === 'transitioning'

  return (
    <div className="relative flex-1 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {/* Current left panel (exits up) */}
        <motion.div
          key={`left-${currentRound.left.ability.id}`}
          className="absolute inset-x-0 top-0 h-1/2"
          variants={mobileVariants}
          initial="center"
          animate={isTransitioning ? 'exit' : 'center'}
          exit="exit"
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <SplitPanel
            ability={currentRound.left}
            side="left"
            showCooldown={showCooldown}
            isCorrect={lastGuessCorrect === false ? false : null}
          />
        </motion.div>

        {/* Current right panel (shifts up to left position) */}
        <motion.div
          key={`right-${currentRound.right.ability.id}`}
          className="absolute inset-x-0 bottom-0 h-1/2"
          variants={mobileVariants}
          initial="center"
          animate={isTransitioning ? { y: '-100%' } : 'center'}
          exit="exit"
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <SplitPanel
            ability={currentRound.right}
            side="right"
            showCooldown={showCooldown}
            isCorrect={lastGuessCorrect === true ? false : null}
          />
        </motion.div>

        {/* Next round left panel (enters from bottom) */}
        {isTransitioning && nextRound && (
          <motion.div
            key={`next-${nextRound.left.ability.id}`}
            className="absolute inset-x-0 bottom-0 h-1/2"
            variants={mobileVariants}
            initial="enter"
            animate="center"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <SplitPanel
              ability={nextRound.left}
              side="left"
              showCooldown={false}
              isCorrect={null}
              skipAnimation
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Top panel exits upward
- [ ] Bottom panel shifts up to top position
- [ ] New panel enters from bottom
- [ ] Animations are smooth 400ms
- [ ] No white flash between panels on iOS Safari
- [ ] VS divider stays centered during transition

---

### 3.3 GuessButtons with Motion

**File:** `src/components/game/GuessButtons.tsx` (migrated)

```typescript
'use client'

import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'

interface GuessButtonsProps {
  onGuess: (choice: 'left' | 'right') => void
  disabled: boolean
  hidden: boolean
}

export function GuessButtons({ onGuess, disabled, hidden }: GuessButtonsProps) {
  return (
    <motion.div
      className="hidden md:flex flex-col gap-3 absolute right-8 top-1/2 -translate-y-1/2 z-30"
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: hidden ? 'none' : 'auto' }}
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="gold"
          size="xl"
          onClick={() => onGuess('left')}
          disabled={disabled}
          className="w-full"
        >
          ← Left Lower
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="gold"
          size="xl"
          onClick={() => onGuess('right')}
          disabled={disabled}
          className="w-full"
        >
          Right Lower →
        </Button>
      </motion.div>
    </motion.div>
  )
}
```

**File:** `src/components/game/MobileGuessButtons.tsx` (migrated)

```typescript
'use client'

import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'

interface MobileGuessButtonsProps {
  onGuess: (choice: 'left' | 'right') => void
  disabled: boolean
  hidden: boolean
}

export function MobileGuessButtons({ onGuess, disabled, hidden }: MobileGuessButtonsProps) {
  return (
    <motion.div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: hidden ? 'none' : 'auto' }}
    >
      <div className="flex gap-3 max-w-md mx-auto">
        <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
          <Button
            variant="gold"
            size="lg"
            onClick={() => onGuess('left')}
            disabled={disabled}
            className="w-full shadow-lg shadow-black/30"
          >
            ↑ Top
          </Button>
        </motion.div>

        <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
          <Button
            variant="gold"
            size="lg"
            onClick={() => onGuess('right')}
            disabled={disabled}
            className="w-full shadow-lg shadow-black/30"
          >
            ↓ Bottom
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
```

**Acceptance Criteria:**
- [ ] Buttons fade out during revealing/transitioning phases
- [ ] Buttons fade back in when playing
- [ ] Tap feedback shows scale-down effect
- [ ] Mobile buttons respect safe area insets
- [ ] Desktop buttons positioned correctly on right side
- [ ] Disabled state prevents interaction

---

### 3.4 ScoreDisplay with Motion

**File:** `src/components/game/ScoreDisplay.tsx` (migrated)

```typescript
'use client'

import { motion, AnimatePresence } from 'motion/react'

interface ScoreDisplayProps {
  score: number
  highScore: number
  lives: number
  maxLives: number
}

export function ScoreDisplay({ score, highScore, lives, maxLives }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-dark-blue/80 backdrop-blur-sm">
      {/* Score */}
      <div className="flex items-center gap-2">
        <span className="text-foreground/70">Score:</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-xl font-bold text-gold"
          >
            {score}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Lives */}
      <div className="flex gap-1">
        {Array.from({ length: maxLives }).map((_, i) => (
          <motion.span
            key={i}
            animate={{
              scale: i < lives ? 1 : 0.7,
              opacity: i < lives ? 1 : 0.3,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="text-xl"
          >
            ❤️
          </motion.span>
        ))}
      </div>

      {/* High Score */}
      <div className="flex items-center gap-2">
        <span className="text-foreground/70">Best:</span>
        <span className="text-lg font-semibold">{highScore}</span>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Score number pops when increasing
- [ ] Lost hearts shrink and fade
- [ ] High score updates when beaten
- [ ] No layout shift during animations

---

## Phase 4: Integration & Cleanup

### 4.1 CooldownClash Integration

**File:** `src/components/game/CooldownClash.tsx`

Key changes:
1. Replace `setTimeout` timing with `onAnimationComplete` callbacks
2. Import new motion-based components
3. Remove CSS animation class logic

```typescript
// In transition handling:
const handleTransitionComplete = () => {
  dispatch({ type: 'TRANSITION_COMPLETE' })
}

// In SplitPanel usage:
<motion.div
  onAnimationComplete={() => {
    if (phase === 'transitioning') {
      handleTransitionComplete()
    }
  }}
>
  ...
</motion.div>
```

**Acceptance Criteria:**
- [ ] Game flow works: idle → playing → revealing → transitioning → playing
- [ ] Animation completion triggers state transitions (not setTimeout)
- [ ] Image preloading still works
- [ ] Lives decrease on wrong guess
- [ ] Game over triggers at 0 lives
- [ ] Restart works cleanly

---

### 4.2 CSS Cleanup

Remove from `src/app/globals.css`:

```css
/* DELETE: All @keyframes (lines ~45-253) */
/* DELETE: All .animate-* utility classes (lines ~255-365) */
/* KEEP: CSS variables, base styles, reduced motion media query */
```

**Acceptance Criteria:**
- [ ] No unused CSS keyframes
- [ ] No unused animation utility classes
- [ ] globals.css reduced by ~300 lines
- [ ] Build still passes
- [ ] No visual regressions

---

### 4.3 Delete Unused Files

```bash
rm src/components/game/AbilityCard.tsx  # Unused alternative component
```

---

## Phase 5: Testing & Polish

### 5.1 Testing Checklist

**Unit Tests:**
- [ ] Button variants render correctly (snapshot)
- [ ] Game reducer produces correct state

**Component Tests:**
- [ ] AbilityIcon tooltip shows on hover
- [ ] AbilityIcon drawer opens on mobile tap
- [ ] GameOver buttons trigger callbacks
- [ ] GuessButtons disabled during reveal

**E2E Tests (Playwright):**
- [ ] Full game flow
- [ ] Game over and restart
- [ ] High score persistence
- [ ] Mobile responsive layout

**Device Testing:**
- [ ] iPhone Safari (critical - iOS animation quirks)
- [ ] iPhone SE (small viewport)
- [ ] Android Chrome
- [ ] Desktop Chrome/Firefox/Safari

### 5.2 Performance Validation

- [ ] Lighthouse Performance score ≥ 90
- [ ] No animation frame drops (60fps)
- [ ] Bundle size increase < 35KB (Framer Motion)
- [ ] No memory leaks from unmounted motion components

### 5.3 Accessibility

- [ ] Reduced motion respects `prefers-reduced-motion`
- [ ] Focus management in dialogs
- [ ] Screen reader announces game state changes
- [ ] Touch targets ≥ 44x44px

---

## Migration Order Summary

```
Phase 1: Foundation (1 day)
├── Install dependencies
├── Configure shadcn theme
└── Create motion presets

Phase 2: UI Components (2 days)
├── Button migration
├── Dialog (GameOver)
├── Tooltip + Drawer (AbilityIcon)
└── Delete old components

Phase 3: Animations (3 days)
├── SplitPanel with motion
├── Mobile carousel
├── GuessButtons
└── ScoreDisplay

Phase 4: Integration (1 day)
├── CooldownClash integration
├── CSS cleanup
└── Delete unused files

Phase 5: Testing (2 days)
├── Unit/component tests
├── E2E tests
├── Device testing
└── Performance validation
```

---

## Rollback Strategy

1. **Feature flag:** `NEXT_PUBLIC_USE_MOTION_ANIMATIONS=true`
2. Keep old components in `src/components/game/legacy/` during migration
3. Conditional imports in CooldownClash for gradual rollout
4. Full rollback: revert to commit before Phase 3

---

## Future Considerations

Once this migration is complete, the foundation enables:

- **New game modes:** Reusable Panel, Button, Dialog components
- **Swipe gestures:** Framer Motion drag for mobile guess input
- **Shared element transitions:** `layoutId` for ability cards between views
- **Micro-interactions:** Easy to add polish (hover states, success celebrations)
- **Theme variants:** shadcn theming for seasonal events

---

## References

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Framer Motion (Motion) Docs](https://motion.dev/docs/react-motion-component)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- Current codebase: `src/components/game/CooldownClash.tsx:1-468`
- Current animations: `src/app/globals.css:45-365`
