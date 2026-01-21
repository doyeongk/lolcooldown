# iOS Safari Animation Flash - Handover Document

## The Problem

On iOS Safari, there is a **white flash** at the **start and end** of the mobile vertical slide animation (TikTok-style swipe). The desktop horizontal slide animation works perfectly without any flash.

**Expected behaviour:** Smooth vertical slide transition identical to desktop's horizontal slide.
**Actual behaviour:** Brief white flash visible when animation starts and when it completes.

---

## Technical Context

### The Animation System

The game shows two ability cards. When the user guesses:
1. **Reveal phase** (1500ms): Show the cooldown, display green/red feedback overlay
2. **Transition phase**: Carousel animation slides cards to show the next round

**Desktop (working):** Horizontal carousel — left card exits left, right card shifts left, new card enters from right.

**Mobile (flashing):** Vertical carousel — top card exits up, bottom card shifts up, new card enters from bottom.

### Current Implementation

**CooldownClash.tsx** renders three panels during transition:
- Exiting panel: `position: absolute`, slides out of viewport
- Shifting panel: Normal flow, slides into exiting position
- Entering panel: Normal flow, slides in from off-screen

**SplitPanel.tsx** contains:
- Champion splash image background
- Dark overlay
- Feedback overlay (green/red tint based on `isCorrect` prop)
- Content (champion name, ability, etc.)

**globals.css** defines keyframe animations:
- `panel-slide-up-exit`: translateY(0) → translateY(-100%)
- `panel-slide-up-shift`: translateY(100%) → translateY(0)
- `panel-slide-up-enter`: translateY(100%) → translateY(0)

---

## Root Cause Analysis

The flash is caused by **WebKit layer recompositing**. When CSS transforms/animations are applied, Safari must promote elements to GPU-composited layers. This transition causes a momentary flash. A WebKit engineer has confirmed this is a known bug.

### Why Desktop Doesn't Flash

After thorough comparison, desktop and mobile implementations are now nearly identical:
- Same GPU acceleration hints
- Same transform approach
- Same animation utilities

The key difference is the **axis of movement** (X vs Y) and potentially how iOS Safari handles:
1. Vertical transforms differently from horizontal
2. Viewport height calculations (`calc(var(--vh,1vh)*50)`)
3. Stacking context with flex-column vs flex-row

---

## Attempts Made

### Attempt 1: Add GPU Acceleration to Wrapper Divs
**Commit:** `b2e1d35`

**Changes:**
- Added `.gpu-accelerated` class with `translateZ(0)` and `backface-visibility: hidden`
- Applied to all wrapper divs during transition

**Why it didn't work:** The elements were already being promoted to GPU layers by the animation. Adding `translateZ(0)` to wrappers didn't prevent the flash because the SplitPanel children weren't pre-composited.

---

### Attempt 2: Always Render Feedback Overlay + CSS Containment
**Commit:** `ce4779e`

**Changes:**
- Changed feedback overlay from conditional render to always-rendered with opacity control
- Added `isolation: isolate` and `contain: layout paint` to SplitPanel
- Enhanced `.gpu-accelerated` with containment properties
- Added `perspective: 1000px` to parent container

**Why it didn't work:** CSS containment (`isolation`, `contain`) doesn't work reliably in Safari and may actually cause issues. Research confirmed Safari ignores or mishandles these properties.

---

### Attempt 3: Use translate3d and Remove Containment
**Commit:** `5d51a00`

**Changes:**
- Used `translate3d(0, Y, 0)` instead of `translateY()` in keyframes
- Removed `isolation: isolate` and `contain: layout paint`
- Changed `opacity-0` to `opacity-[0.01]` to avoid Safari's opacity-from-zero bug
- Removed feedback overlay during mobile transition

**Why it didn't work:** The translate3d vs translateY distinction doesn't matter — both trigger GPU compositing. The underlying layer promotion timing issue persists.

---

### Attempt 4: Match Desktop Pattern Exactly
**Commit:** `0830c19`

**Changes:**
- Removed `overflow-hidden` from mobile exiting wrapper (desktop doesn't have it)
- Removed GPU hints (`will-change`, `translateZ(0)`, `backface-visibility`) from mobile animation utilities (desktop doesn't use them in utility classes)
- Changed `translate3d` back to `translateY` in keyframes (match desktop's 2D approach)
- Restored feedback overlay on mobile (like desktop)

**Why it didn't work:** The fundamental difference isn't in the CSS — it's in how iOS Safari handles vertical transforms and viewport height calculations differently from horizontal transforms.

---

## Current State of the Code

### CooldownClash.tsx (Mobile Transition)
```tsx
// Exiting top - slides up
<div className="absolute inset-x-0 top-0 h-[calc(var(--vh,1vh)*50)] z-10 gpu-accelerated">
  <SplitPanel exitAnimation="slide-up" isCorrect={null} />
</div>

// Old bottom - slides up with feedback
<div className="h-[calc(var(--vh,1vh)*50)] gpu-accelerated">
  <SplitPanel enterAnimation="slide-up-shift" isCorrect={state.lastGuessCorrect} />
</div>

// New card - enters from bottom
<div className="h-[calc(var(--vh,1vh)*50)] gpu-accelerated">
  <SplitPanel enterAnimation="slide-up" isCorrect={null} />
</div>
```

### globals.css (Mobile Animations)
```css
@keyframes panel-slide-up-exit {
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
}

.animate-panel-slide-up-exit {
  animation: panel-slide-up-exit 0.4s ease-out forwards;
}

.gpu-accelerated {
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
```

### SplitPanel.tsx
```tsx
<div
  className={`relative h-[calc(var(--vh,1vh)*50)] ...`}
  style={{
    transform: 'translate3d(0, 0, 0)',
    WebkitTransform: 'translate3d(0, 0, 0)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  }}
>
  {/* Feedback overlay - always rendered */}
  <div className={`... ${isCorrect === null ? 'opacity-[0.01]' : 'opacity-100'}`} />
</div>
```

---

## What We Haven't Tried

### 1. CSS `transform-style: preserve-3d` on Container
Research suggests this might help Safari maintain consistent 3D context:
```css
.transition-container {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}
```

### 2. Apply `backface-visibility: hidden` to ALL Child Elements
Including the `<Image>` component and all nested elements:
```css
.split-panel,
.split-panel * {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
```

### 3. Use `position: fixed` Instead of `position: absolute`
Fixed positioning automatically gets promoted to a composited layer with synchronised destruction timing:
```tsx
<div className="fixed inset-x-0 top-0 ...">
```

### 4. View Transitions API (iOS 18+ only)
Native browser API designed for state transitions:
```javascript
document.startViewTransition(() => {
  // Update state
});
```
Would require feature detection and fallback.

### 5. CSS Scroll Snap (Architecture Change)
Use native browser scrolling instead of programmatic transitions:
```css
.container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
}
.card {
  scroll-snap-align: start;
}
```
Would require significant refactoring of the game logic.

### 6. Disable Animations on iOS Safari
Detect iOS and use instant transitions:
```javascript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
// Use instant state change instead of animation
```

### 7. Add `contain: strict` to Animated Panels
More aggressive containment:
```css
.split-panel {
  contain: strict;
}
```

### 8. Remove Viewport Height Calculation
The `calc(var(--vh,1vh)*50)` might be causing layout recalculations:
```css
/* Try fixed 50vh instead */
height: 50vh;
```

---

## Research Summary

### Confirmed Facts
1. This is a **known WebKit bug** related to layer compositing
2. The flash occurs when Safari switches between CPU and GPU rendering modes
3. Desktop horizontal animations don't flash because Safari handles X-axis transforms more reliably
4. iOS Safari 15.4+ has additional rendering bugs with opacity + keyframe animations
5. `isolation: isolate` does NOT work reliably in Safari
6. The `--vh` CSS variable workaround for iOS viewport height might be contributing

### Library Status on iOS Safari
- **Framer Motion:** Known Safari bugs (double animation, elements disappearing)
- **GSAP:** Performance issues on iOS 18+
- **react-spring:** General Safari performance problems
- **Swiper:** Has same flash issue, recommends `cssMode: true` which reduces functionality

### Potential Solutions (Untested)
1. **View Transitions API** — best native option, requires iOS 18+
2. **CSS Scroll Snap** — would avoid the issue entirely but requires architecture change
3. **Instant transitions on iOS** — pragmatic fallback

---

## Files Involved

| File | Purpose |
|------|---------|
| `src/components/game/CooldownClash.tsx` | Main game component, transition logic |
| `src/components/game/SplitPanel.tsx` | Individual panel component |
| `src/app/globals.css` | Animation keyframes and utilities |
| `src/lib/hooks/useMediaQuery.ts` | `useIsMobile()` hook for platform detection |
| `src/components/ViewportHeight.tsx` | Sets `--vh` CSS variable for iOS |

---

## Commits Related to This Issue

1. `b2e1d35` - fix(ui): prevent iOS Safari white flash with CSS containment
2. `ce4779e` - fix(ui): prevent iOS Safari white flash during slide transitions
3. `916e11f` - fix(ui): remove opacity from slide animations for solid cards
4. `5d51a00` - fix(ui): resolve iOS Safari animation flash and feedback overlay issues
5. `0830c19` - fix(ui): match mobile animation pattern to working desktop version

---

## Recommendation

Given the persistent nature of this issue and its root cause being a WebKit bug, the most pragmatic solutions are:

1. **Short-term:** Add `transform-style: preserve-3d` and apply `backface-visibility: hidden` to all child elements including images. If that fails, try `position: fixed` for the exiting element.

2. **Medium-term:** Implement View Transitions API with feature detection for iOS 18+ users.

3. **Fallback:** Detect iOS Safari and use instant/cross-fade transitions instead of sliding animations.

The issue may also resolve itself as Apple fixes WebKit bugs in future Safari versions.
