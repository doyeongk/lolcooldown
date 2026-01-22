# Mobile UI Fixes - Handover Document

## Problem Statement

Three mobile UI issues on iOS Safari:
1. **Header overlap** - Back button collides with ScoreDisplay on narrow screens
2. **Lower button obscured** - Bottom button cut off by iOS home indicator
3. **Safe area insets incomplete** - Content not respecting iOS safe areas

## What Was Attempted

### Changes Made (currently in codebase)

**1. CooldownClash.tsx (line 251)**
Changed viewport height from `h-screen` to `h-dvh`:
```tsx
// Before
<div className="relative h-screen w-screen overflow-hidden pb-[env(safe-area-inset-bottom)]">

// After
<div className="relative h-dvh w-screen overflow-hidden">
```

**2. CooldownClash.tsx (lines 252-279)**
Replaced separate absolute-positioned back button and score with unified flex header:
```tsx
<header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
  <Link ...>back button</Link>
  <ScoreDisplay ... />
  <div className="w-9" aria-hidden="true" /> {/* Spacer */}
</header>
```

**3. SplitPanel.tsx (line 74)**
Added conditional bottom safe area padding for right panel:
```tsx
<div className={`relative z-10 flex flex-col items-center text-center px-4 gap-3 md:gap-4 ${side === 'right' ? 'pb-[env(safe-area-inset-bottom)] md:pb-0' : ''}`}>
```

## What Didn't Work

User reported the changes didn't fix the issues. Possible reasons:

1. **dvh browser support** - `h-dvh` requires Tailwind v3.4+ and may need fallback
2. **Safe area env vars** - May not be working if viewport meta tag isn't set correctly
3. **Flex layout interaction** - The `h-full` on split container may not account for header height
4. **Content still centred** - `justify-center` on panels may push content into unsafe areas

## Investigation Needed

### 1. Check viewport meta tag in layout
File: `src/app/layout.tsx`
Should have: `viewport-fit=cover` for safe area insets to work
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### 2. Check Tailwind version supports dvh
File: `package.json`
Need Tailwind CSS 3.4+ for `h-dvh` utility

### 3. Consider alternative approaches

**Option A: Use min-height instead**
```tsx
<div className="relative min-h-[100dvh] w-screen overflow-hidden">
```

**Option B: CSS custom property fallback**
```css
.container {
  height: 100vh;
  height: 100dvh; /* Fallback pattern */
}
```

**Option C: Account for header in split panels**
The split container uses `h-full` but header overlays it. May need:
```tsx
<div className="flex flex-col md:flex-row h-full w-full pt-16"> {/* Account for header */}
```

**Option D: Use padding on outer container instead of inner**
Move `pb-[env(safe-area-inset-bottom)]` to the outer container but also adjust the flex children heights.

## Files Modified
- `src/components/game/CooldownClash.tsx`
- `src/components/game/SplitPanel.tsx`

## Files to Check
- `src/app/layout.tsx` - viewport meta tag
- `package.json` - Tailwind version
- `tailwind.config.ts` - any custom config that might affect this

## To Revert Changes
```bash
git checkout -- src/components/game/CooldownClash.tsx src/components/game/SplitPanel.tsx
```

## Testing Steps
1. Run `npm run dev`
2. Open on iOS Safari (real device or Xcode Simulator)
3. Check: Lower "Higher/Lower" buttons visible above home indicator
4. Check: Back button doesn't overlap score on iPhone SE width (375px)
5. Check: Content adjusts when Safari toolbar appears/hides
