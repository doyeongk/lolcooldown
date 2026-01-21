# Handover: iOS Safari Mobile Layout 60/40 Split Issue

## Problem
On iOS Safari mobile, the two champion panels show an unequal ~60/40 height split instead of 50/50. Desktop and Android work correctly.

## What We've Tried

### Attempt 1: `svh` units (commit 5417353)
Changed container from `h-screen` to `h-svh` (small viewport height).
**Result:** Did not fix the issue.

### Attempt 2: `h-full` inheritance (commit 8a3f346)
Changed `CooldownClash.tsx` container from `h-svh w-screen` to `h-full w-full`.

**Rationale:** The layout uses `fixed inset-0` which should establish correct viewport bounds. Using `h-full` to inherit from this parent avoids viewport unit inconsistencies.

**Result:** Did not fix the issue.

## Current State

**File:** `src/components/game/CooldownClash.tsx:252`
```tsx
<div className="relative h-full w-full overflow-hidden">
```

**Layout hierarchy:**
1. `layout.tsx`: wrapper with `fixed inset-0`
2. `CooldownClash.tsx`: game container (currently `h-full w-full`)
3. Split container: `flex flex-col md:flex-row h-full w-full`
4. `SplitPanel.tsx`: each panel uses `h-1/2 md:h-full md:w-1/2`

## Key Files
- `src/app/play/random/layout.tsx` - fixed positioning wrapper
- `src/components/game/CooldownClash.tsx` - main game component
- `src/components/game/SplitPanel.tsx` - individual panel component
- `src/app/globals.css` - global styles, has `min-height: 100svh` on body

## Observations
- The bottom controls/buttons position correctly (iOS accounts for bottom nav bar)
- The URL bar area seems to be the source of inconsistency
- Problem is specific to iOS Safari; Android Chrome works fine
- Emulators don't accurately replicate the issue

## Ideas Not Yet Tried
- Using CSS `env(safe-area-inset-top)` to account for URL bar
- JavaScript-based viewport height calculation (`window.innerHeight`)
- Using `dvh` (dynamic viewport height) units
- Investigating if the flex container itself needs different sizing
- Checking if there's a wrapper element causing the mismatch
