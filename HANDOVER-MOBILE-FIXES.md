# Handover: Mobile UI Fixes (Incomplete)

## Summary

Attempted to fix two mobile UI issues. Changes were committed but **did not resolve the problems**.

**Commit:** `9ce244c` - `fix(ui): improve mobile tooltip z-index and iOS safe area`

---

## Issue 1: Desktop Tooltip Obscured by Adjacent Panel

### Problem
When hovering over the ability icon on the **left panel**, the tooltip appears behind the right panel due to stacking context.

### Root Cause
The `SplitPanel` components are siblings in a flex container (`CooldownClash.tsx:283-305`). Each panel has `overflow-hidden` which creates a stacking context. The right panel renders after the left panel in the DOM, so it naturally sits on top.

### What Was Attempted
Changed the desktop tooltip in `AbilityIcon.tsx` from:
- `absolute z-20` positioning (relative to parent)
- To `fixed z-50` positioning with calculated coordinates via `getBoundingClientRect()`

### Why It Didn't Work
Possible reasons:
1. The `fixed` positioning should escape stacking context, but `z-50` may still not be enough given other `z-30` elements (back button, score display at `CooldownClash.tsx:253-280`)
2. The tooltip position calculation happens on `mouseenter` but doesn't account for scroll or viewport edge cases
3. The `tooltipPosition` state may not be set in time (race condition)

### Better Approaches to Try
1. **Portal the tooltip** - Render tooltip outside the component tree using React Portal to `document.body`
2. **Use a tooltip library** - Radix UI `@radix-ui/react-tooltip` or Floating UI handles positioning and portals
3. **Increase z-index significantly** - Try `z-[9999]` to ensure it's above everything
4. **Remove `overflow-hidden`** from SplitPanel - But this may cause other layout issues

---

## Issue 2: iOS Safe Area (Buttons Blocked by Safari Navigation)

### Problem
On iOS Safari, the Higher/Lower buttons at the bottom of the right panel are blocked by Safari's bottom navigation bar.

### What Was Attempted
1. Added `viewport-fit: "cover"` to `layout.tsx:15-17` via Next.js `Viewport` export
2. Added `pb-[env(safe-area-inset-bottom)]` to the content div in `SplitPanel.tsx:74` (only for right panel)

### Why It Didn't Work
Possible reasons:
1. The padding is applied to the content container, but the content is **vertically centred** (`items-center justify-center` on parent). Adding bottom padding doesn't push content up when using flexbox centering.
2. The `env(safe-area-inset-bottom)` value might be 0 if the viewport meta tag isn't being applied correctly
3. On mobile, panels stack vertically (`flex-col` on mobile per `CooldownClash.tsx:284`), so the right panel is at the bottom. The `h-1/2` height constraint may not leave room for the safe area.

### Better Approaches to Try
1. **Apply safe area to the root container** - Add `pb-[env(safe-area-inset-bottom)]` to the main game container in `CooldownClash.tsx:251`
2. **Reduce panel height on mobile** - Change `h-1/2` to `h-[calc(50%-env(safe-area-inset-bottom)/2)]` or similar
3. **Move buttons higher** - Add margin-bottom to GuessButtons component instead of padding on container
4. **Test on actual iOS device** - Safari DevTools simulation may not accurately reflect safe area insets

---

## Files Modified

| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Added `viewport: { viewportFit: "cover" }` export |
| `src/components/game/AbilityIcon.tsx` | Changed desktop tooltip to `fixed` positioning with `z-50`, added `useRef` for button position calculation |
| `src/components/game/SplitPanel.tsx` | Added `pb-[env(safe-area-inset-bottom)]` to right panel content |

---

## Component Hierarchy

```
CooldownClash (h-screen w-screen overflow-hidden)
├── Back button (z-30)
├── ScoreDisplay (z-30)
├── Flex container (flex-col md:flex-row)
│   ├── SplitPanel[left] (flex-1 h-1/2 overflow-hidden)
│   │   └── AbilityIcon
│   │       └── Tooltip (fixed z-50) ← SHOULD appear above everything
│   └── SplitPanel[right] (flex-1 h-1/2 overflow-hidden)
│       └── GuessButtons ← BLOCKED by iOS safe area
├── VsDivider (z-20)
└── GameOver modal (when active)
```

---

## Recommended Next Steps

1. **For tooltip:** Use React Portal or a proper tooltip library (Radix/Floating UI)
2. **For iOS safe area:** Test on real device, apply safe area padding to root game container
3. **Consider mobile-first redesign:** The split panel layout may fundamentally not work well on mobile Safari with the home indicator

---

## Testing Notes

- Dev server: `npm run dev` → `http://localhost:3000/play/random`
- Tooltip test: Hover over ability icon on LEFT panel (the one showing cooldown)
- iOS test: Open on iPhone Safari, check if buttons are fully visible above home indicator
