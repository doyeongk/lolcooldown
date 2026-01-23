# Phase 3: Animation System Migration

## Overview

Migrate all CSS keyframe animations to Framer Motion for a consistent, declarative animation system. This is the core of the frontend refactoring effort.

**Goal:** Replace ~300 lines of CSS keyframes with state-driven Framer Motion variants
**Status:** 🔄 In Progress

---

## Current State Analysis (Updated 2026-01-23)

### Components to Migrate

| Component | Current State | Target State |
|-----------|---------------|--------------|
| **SplitPanel.tsx** (161 lines) | CSS class mapping via `panelAnimation` variable | `motion.div` with variants |
| **CooldownClash.tsx** (459 lines) | CSS class toggling for carousel | `AnimatePresence` with variants |
| **GuessButtons.tsx** (93 lines) | Tailwind transitions | Framer Motion `whileTap` |
| **ScoreDisplay.tsx** (48 lines) | No animations | `AnimatePresence` for score pop |

### CSS Keyframes to Migrate (lines 116-331 in globals.css)

| Category | Keyframes | Used In | Priority |
|----------|-----------|---------|----------|
| Panel Entrance | `panel-slide-left`, `panel-slide-right` | SplitPanel default | High |
| Desktop Carousel | `panel-exit-left`, `panel-shift-left`, `panel-enter-right` | CooldownClash desktop | High |
| Mobile Carousel | `mobile-exit-up`, `mobile-shift-up`, `mobile-enter-up` | CooldownClash mobile | High |
| Feedback | `correct-pulse`, `incorrect-shake` | Not currently used (variants exist) | Medium |
| Cooldown Reveal | `cooldown-reveal` | Not used (using `numberPop` variant) | Low |
| Slides | `slide-in-left`, `slide-in-right` | AbilityCard (unused) | Low |
| Home Background | `icon-row-scroll`, `particle-float` | IconWall, GoldParticles | Keep (Phase 4) |
| Radix/Tailwind | `enter`, `exit` | Dialog, Sheet, Tooltip | Keep |

### Existing Motion Infrastructure

**File:** `src/lib/motion/variants.ts` (113 lines)

Already defined:
- `numberPop` - Used in SplitPanel for cooldown reveal (right panel only)
- `desktopPanelVariants` - { enter, center, exitLeft, shiftLeft } - **NOT USED**
- `mobilePanelVariants` - { enter, center, exitUp } - **NOT USED**
- `correctPulse`, `incorrectShake` - **NOT USED**
- `panelTransition` - 0.5s tween with ease-out

**Problem:** Variants are defined but components still use CSS classes instead.

---

## Execution Plan

### Task 1: Wire Motion Variants into SplitPanel ✅ COMPLETE

**Status:** ✅ Completed 2026-01-23

**Changes Made:**
- Replaced CSS class mapping with Framer Motion `motion.div` and inline variants
- Added `panelVariants` object with all animation states (enterFromLeft, enterFromRight, center, exitLeft, etc.)
- Added `getAnimationState()` function to determine animation based on props
- Added `useReducedMotion()` hook integration
- Kept existing `numberPop` animation for cooldown reveal
- Kept feedback overlay using Tailwind opacity transition

**Verification:**
- [x] Build passes: `npm run build`
- [ ] Manual test: Panels slide in from correct sides on game start
- [ ] Manual test: Cooldown number pops when revealed
- [ ] Manual test: `prefers-reduced-motion` shows instant transitions

---

### Task 2: Migrate Desktop Carousel in CooldownClash ✅ COMPLETE

**Status:** ✅ Completed 2026-01-23

**Changes:** Desktop carousel now uses SplitPanel's Framer Motion animations via props. SplitPanel handles all exit/enter animations internally.

---

### Task 3: Migrate Mobile Carousel in CooldownClash ✅ COMPLETE

**Status:** ✅ Completed 2026-01-23

**Changes Made:**
- Added `motion.div` wrappers for all 3 mobile panels
- Created variants: `mobilePanel1Variants`, `mobilePanel2Variants`, `mobilePanel3Variants`
- Added `mobileCarouselTransition` (0.4s ease-out)
- Integrated `useReducedMotion()` hook
- Replaced CSS class toggling with state-driven `animate` prop

**Verification:**
- [x] Build passes: `npm run build`
- [ ] Manual test: Mobile carousel animates smoothly

---

### Task 4: Migrate GuessButtons to Framer Motion ✅ COMPLETE

**Status:** ✅ Completed 2026-01-23

**Changes Made:**
- Converted buttons to `motion.button`
- Added `whileHover={{ scale: 1.05 }}` (desktop only)
- Added `whileTap={{ scale: 0.98 }}` with spring transition
- Replaced `transition-opacity` with Framer Motion `animate` prop
- Integrated `useReducedMotion()` hook
- Changed `transition-all` to `transition-colors` (scale handled by Framer)

**Verification:**
- [x] Build passes: `npm run build`
- [ ] Manual test: Spring press feedback works

---

### Task 5: Add ScoreDisplay Animations ✅ COMPLETE

**Status:** ✅ Completed 2026-01-23

**Changes Made:**
- Added `AnimatePresence` with `mode="popLayout"` for score number
- Score pops with spring animation (stiffness 400, damping 20) when incrementing
- Hearts animate with spring (stiffness 300, damping 20) when lost
- Integrated `useReducedMotion()` hook

**Verification:**
- [x] Build passes: `npm run build`
- [ ] Manual test: Score number pops when incrementing
- [ ] Manual test: Hearts shrink with spring effect when lost

---

### Task 6: CSS Cleanup ✅ COMPLETE

**Status:** ✅ Completed 2026-01-23

**Removed:**
- 18 game animation keyframes (panel-*, mobile-*, cooldown-reveal, etc.)
- 18 corresponding utility classes
- Updated reduced motion block

**Kept:**
- Radix/Shadcn animation utilities
- Home page animations (icon-scroll, particle-float, wall-drift)
- GPU acceleration utility

**Results:**
- **Original:** 498 lines
- **Final:** 239 lines
- **Reduction:** ~52%

**Verification:**
- [x] Build passes: `npm run build`
- [ ] Manual test: Home page still works
- [ ] Manual test: Game page still works

---

## Task Dependencies

```
Task 1 (SplitPanel) ──┬──> Task 6 (CSS Cleanup)
Task 2 (Desktop)    ──┤
Task 3 (Mobile)     ──┤
Task 4 (Buttons)    ──┘
Task 5 (Score)      ──────> Task 6 (CSS Cleanup)
```

Tasks 1-5 can run in parallel with careful coordination.
Task 6 must wait until all animations are migrated.

---

## Subagent Assignment

| Task | Agent Type | Notes |
|------|------------|-------|
| Task 1 | Code modifier | Focus on SplitPanel.tsx |
| Task 2 | Code modifier | Focus on CooldownClash desktop section |
| Task 3 | Code modifier | Focus on CooldownClash mobile section |
| Task 4 | Code modifier | Simple migration |
| Task 5 | Code modifier | New animation code |
| Task 6 | Code modifier | Cleanup only after verification |

---

## Verification Checklist (Post-Migration)

### Functional Tests
- [ ] Game starts correctly (panels slide in)
- [ ] Guessing works (correct/incorrect feedback shows)
- [ ] Round transitions work (panels animate out/in)
- [ ] Game over triggers at 0 lives
- [ ] Restart works cleanly
- [ ] High score persists

### Animation Quality
- [ ] 60fps on desktop Chrome
- [ ] 60fps on iOS Safari
- [ ] No white flash between panels
- [ ] Reduced motion respects `prefers-reduced-motion`

### Accessibility
- [ ] Screen reader announces game state
- [ ] Focus management works
- [ ] Touch targets >= 44x44px

---

## Risk Mitigation

1. **iOS Safari quirks:** All motion.div elements must use `translate3d` and `backfaceVisibility: 'hidden'`
2. **Animation timing:** Keep REVEAL_DELAY and TRANSITION_DELAY constants, wire `onAnimationComplete` where appropriate
3. **Rollback:** Keep CSS keyframes until full verification, then delete

---

## Progress Log

| Date | Task | Status | Notes |
|------|------|--------|-------|
| 2026-01-23 | Plan created | ✅ | Initial analysis complete |
| 2026-01-23 | Task 1: SplitPanel | ✅ | Migrated to Framer Motion variants |
| 2026-01-23 | Task 2: Desktop Carousel | ✅ | Uses SplitPanel's Framer Motion |
| 2026-01-23 | Task 3: Mobile Carousel | ✅ | Added motion.div wrappers with variants |
| 2026-01-23 | Task 4: GuessButtons | ✅ | Added whileHover/whileTap with spring |
| 2026-01-23 | Task 5: ScoreDisplay | ✅ | Added AnimatePresence for score pop |
| 2026-01-23 | Task 6: CSS Cleanup | ✅ | Removed 259 lines (52% reduction) |

---

## References

- Main refactor plan: `plans/in progress/refactor-frontend-shadcn-framer-motion.md`
- Motion variants: `src/lib/motion/variants.ts`
- CooldownClash: `src/components/game/CooldownClash.tsx`
- SplitPanel: `src/components/game/SplitPanel.tsx`
