# Animation System

## Overview

All animations use Framer Motion. CSS keyframe animations are avoided for consistency and accessibility support.

## Motion Presets

Located in `src/lib/motion/variants.ts`:

### Entrance Animations

| Variant | Use Case |
|---------|----------|
| `fadeIn` | Generic fade in/out |
| `scaleIn` | Elements that grow into view |
| `numberPop` | Cooldown number reveal |
| `cooldownReveal` | Combines fade + scale |
| `slideInLeft` | Panel entering from left |
| `slideInRight` | Panel entering from right |

### Feedback Animations

| Variant | Use Case |
|---------|----------|
| `correctPulse` | Green glow pulse on correct guess |
| `incorrectShake` | Horizontal shake on wrong guess |

### Panel Carousel (Desktop)

| Variant | Description |
|---------|-------------|
| `desktopPanelVariants.enter` | Enter from right (x: 100%) |
| `desktopPanelVariants.center` | Visible position (x: 0) |
| `desktopPanelVariants.exitLeft` | Exit to left (x: -100%) |
| `desktopPanelVariants.shiftLeft` | Shift from right to center |

### Panel Carousel (Mobile)

| Variant | Description |
|---------|-------------|
| `mobilePanel1Variants.static` | Top panel resting (y: 0) |
| `mobilePanel1Variants.exit` | Exit upward (y: -100%) |
| `mobilePanel2Variants.static` | Middle panel resting (y: 100%) |
| `mobilePanel2Variants.shift` | Shift to top (y: 0) |
| `mobilePanel3Variants.hidden` | Bottom panel hidden (y: 200%) |
| `mobilePanel3Variants.enter` | Enter to middle (y: 100%) |

## Timing Constants

Located in `src/lib/motion/timing.ts`:

```typescript
export const TIMING = {
  REVEAL_DELAY: 1200,        // ms before transition starts
  MOBILE_TRANSITION: 350,    // ms for mobile carousel
  DESKTOP_TRANSITION: 400,   // ms for desktop carousel
  PANEL_DURATION: 0.28,      // seconds (Framer Motion)
  FEEDBACK_DURATION: 0.5,    // seconds for pulse/shake
}
```

## Mobile Carousel Architecture

Mobile uses a stable 3-panel DOM structure:

```
┌─────────────┐
│  Panel 1    │ ← Current left (exits up)
│  (visible)  │
├─────────────┤
│  Panel 2    │ ← Current right (shifts up)
│  (visible)  │
├─────────────┤
│  Panel 3    │ ← Next ability (enters from bottom)
│  (hidden)   │
└─────────────┘
```

**Why 3 panels?**
- Avoids DOM mutations during animation
- Prevents React key changes from interrupting Framer Motion
- Uses `onAnimationComplete` for precise timing

## GPU Acceleration

Animations use transform-only properties for 60fps:

```tsx
style={{
  willChange: 'transform',
  contain: 'layout paint',
  backfaceVisibility: 'hidden',
}}
```

**Patterns used:**
- `x`, `y` for position (not `left`, `top`)
- `scale` for size (not `width`, `height`)
- `opacity` for visibility
- `z: 0` to pre-promote GPU layers

## Accessibility

### useReducedMotion Hook

```tsx
import { useReducedMotion } from '@/lib/motion'

const prefersReducedMotion = useReducedMotion()

<motion.div
  transition={prefersReducedMotion ? { duration: 0 } : normalTransition}
/>
```

### Implementation

All motion presets respect `prefers-reduced-motion`:
- Entrance animations: Instant (duration: 0)
- Carousel transitions: Instant snap
- Feedback animations: Static color change only

## Animation Completion Callbacks

Use Framer Motion's `onAnimationComplete` instead of `setTimeout`:

```tsx
<motion.div
  onAnimationComplete={(definition) => {
    if (definition === 'shift' && state.phase === 'transitioning') {
      dispatch({ type: 'TRANSITION_COMPLETE' })
    }
  }}
/>
```

This ensures state changes happen at the exact animation end, not a guessed timeout.
