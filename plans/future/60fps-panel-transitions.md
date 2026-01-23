# Performance Optimization Plan: 60fps Panel Transitions

## Problem
Panel transitions during round changes are choppy with visible lag when splash art images are moving.

## Root Cause Analysis

After reviewing the codebase, I identified these performance bottlenecks:

### 1. **backdrop-filter: blur() is extremely expensive** (Critical)
**File:** `SplitPanel.tsx:332-340`
```tsx
style={{
  backdropFilter: 'blur(3px)',
  WebkitBackdropFilter: 'blur(3px)',
  maskImage: 'radial-gradient(...)',
}}
```
This forces the browser to re-composite every frame during animation. Backdrop blur is one of the most expensive CSS operations, especially on iOS Safari.

### 2. **Multiple overlay layers create composite overhead** (High)
Each panel has 5 overlay divs stacked:
- Dark overlay (line 329)
- Blur vignette (lines 332-340) ← most expensive
- Atmospheric haze (lines 343-348)
- Cinematic vignette (lines 351-356)
- Feedback overlay (lines 359-367)

Each layer forces separate compositing work during animation.

### 3. **No `will-change` hint on animated panels** (High)
**File:** `SplitPanel.tsx:300-310`
The animated `motion.div` wrapper doesn't have `will-change: transform`. The browser doesn't know to promote these elements to GPU layers ahead of animation.

### 4. **Framer Motion JS overhead** (Medium)
Framer Motion calculates animation frames in JavaScript. For GPU-optimal 60fps, pure CSS animations with `transform` are faster because they run entirely on the compositor thread.

### 5. **Animation duration too long** (Medium)
Panel transition is 500ms. Shorter animations (200-300ms) feel snappier and expose fewer frames where jank can be visible.

### 6. **Image decode during animation** (Medium)
The image preloader triggers browser fetch but doesn't ensure the image is decoded and GPU-ready before transition starts. Use `img.decode()` API.

---

## Implementation Plan

### Phase 1: Add GPU Acceleration Hints

**File:** `src/components/game/SplitPanel.tsx`

1. **Add `will-change: transform` to the animated panel wrapper**
   ```tsx
   style={{
     willChange: 'transform',
     transform: 'translateZ(0)', // Force GPU layer promotion
     backfaceVisibility: 'hidden',
     WebkitBackfaceVisibility: 'hidden',
   }}
   ```

2. **Add `contain: layout paint` for CSS containment**
   - Tells browser that layout/paint changes inside the panel don't affect ancestors

### Phase 2: Replace backdrop-filter with Static Blur Layer

**File:** `src/components/game/SplitPanel.tsx`

**Why backdrop-filter is slow:** It samples pixels from *behind* the element on every frame. During animation, this means recalculating blur constantly as content moves. No library can fix this - it's a compositor-level limitation.

**Solution: Static blurred image copy**
1. **Add a second Image element with the same splash, apply `filter: blur()`**
   ```tsx
   {/* Blur vignette - static blurred copy, not backdrop-filter */}
   <div className="absolute inset-0 overflow-hidden pointer-events-none">
     <Image
       src={champion.splash}
       alt=""
       fill
       sizes="(min-width: 768px) 50vw, 100vw"
       quality={30} // Low quality is fine for blur
       className="object-cover object-top blur-[8px] scale-110" // CSS filter blur
       style={{
         maskImage: 'radial-gradient(ellipse 75% 65% at center, transparent 0%, black 75%)',
       }}
     />
   </div>
   ```

2. **Remove the expensive backdrop-filter overlay entirely**
   - Delete lines 332-340 (the blur vignette div with backdrop-filter)

3. **Combine dark overlay + vignette gradients into one layer**
   - Merge atmospheric haze + cinematic vignette into a single gradient div

### Phase 3: Optimize Animation Timing

**File:** `src/components/game/SplitPanel.tsx` and `CooldownClash.tsx`

1. **Reduce transition duration**
   - Change from 500ms → 280ms for panel transitions
   - Use snappier easing: `[0.32, 0, 0.67, 0]` (ease-out-quart)

2. **Use CSS animations for panel slides**
   - Replace Framer Motion transform animations with CSS `@keyframes`
   - Framer Motion can still control animation state, but actual transform runs on compositor

### Phase 4: Ensure Images Are GPU-Ready

**File:** `src/lib/hooks/useImagePreloader.ts`

1. **Add `img.decode()` to preloader**
   ```tsx
   const img = new Image()
   img.src = url
   await img.decode() // Wait for image to be decoded and GPU-ready
   ```

2. **Gate transition start on decode completion**
   - Don't start the carousel animation until next round images are fully decoded

### Phase 5: Add CSS Containment

**File:** `src/components/game/SplitPanel.tsx`

1. **Add containment to panels**
   ```tsx
   style={{ contain: 'layout paint' }}
   ```
   This tells the browser that changes inside the panel don't affect outside layout.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/game/SplitPanel.tsx` | Remove/disable backdrop-filter during animation, add will-change, consolidate overlays, add CSS containment |
| `src/components/game/CooldownClash.tsx` | Pass isAnimating prop, reduce transition timing constants |
| `src/lib/hooks/useImagePreloader.ts` | Add img.decode() for GPU-ready images |
| `src/lib/motion/variants.ts` | Update transition durations and easing |
| `src/app/globals.css` | Add optimized panel animation keyframes |

---

## Verification

1. Run `npm run dev` and open the game
2. Open Chrome DevTools → Performance tab
3. Record a session playing several rounds
4. Verify:
   - Frame rate stays at 60fps during transitions (no red bars in FPS meter)
   - No long tasks (>50ms) during animation frames
   - GPU rasterization shows smooth green bars
5. Test on iOS Safari (most restrictive) via device or BrowserStack
6. Test with `prefers-reduced-motion` enabled

---

## Expected Impact

- **Before:** Choppy transitions with frame drops, especially visible on mobile
- **After:** Smooth 60fps+ transitions, with support for 120Hz on ProMotion displays

The biggest wins will come from:
1. **Replacing backdrop-filter with static blur layer** (~40% improvement) - eliminates per-frame blur recalculation
2. **Adding will-change + GPU layer hints** (~20% improvement) - browser pre-promotes elements to compositor
3. **Reducing animation duration to 280ms** (~15% perceived improvement) - fewer frames where jank is visible
4. **Using img.decode()** (~10% improvement) - ensures images are GPU-ready before animation starts
