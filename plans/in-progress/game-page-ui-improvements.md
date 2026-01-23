# Game Page UI Improvements Plan

## Overview
Reposition game content to the lower half of panels, revert button styles to match home page theme, and improve visual consistency across the game page.

## Files to Modify

| File | Purpose |
|------|---------|
| `src/components/game/SplitPanel.tsx` | Layout shift, remove ability name, champion name styling, alignment |
| `src/components/game/GuessButtons.tsx` | Revert to GameModeCard-style rectangular buttons |
| `src/components/game/ScoreDisplay.tsx` | Simplify status bar styling, remove angular clip-paths |
| `src/components/game/LevelPips.tsx` | Improve visibility with better contrast |
| `src/components/game/CooldownClash.tsx` | Simplify header to match home page theme |
| `src/components/game/AbilityIcon.tsx` | Add ability name to tooltip content |
| `src/components/game/VsDivider.tsx` | No changes (keep current) |

## Reference File
- `src/components/home/GameModeCard.tsx` - Target button style

---

## Phase 1: Layout Shift & Ability Name Tooltip

### SplitPanel.tsx Changes

**Goal:** Move content to lower half, ability name becomes tooltip-only

1. **Change content alignment** (line 204):
   ```diff
   - <div className="relative z-10 flex flex-col items-center text-center px-4 py-4 md:py-6 h-full justify-between">
   + <div className="relative z-10 flex flex-col items-center text-center px-4 py-4 md:py-6 h-full justify-end">
   ```

2. **Remove top spacer** (lines 205-206):
   ```diff
   - {/* Top spacer for header clearance on mobile */}
   - <div className="h-4 md:h-8 shrink-0" />
   ```

3. **Remove ability name from always-visible content** (lines 247-250):
   ```diff
   - {/* Ability name */}
   - <p className="text-base md:text-lg lg:text-xl text-foreground/90 uppercase tracking-wider font-medium drop-shadow-lg">
   -   {ability.name}
   - </p>
   ```

4. **Update champion name to uppercase** (lines 211-216):
   ```diff
   - <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg tracking-wide"
   + <h2 className="text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-lg tracking-wider uppercase"
   ```

5. **Ensure consistent panel alignment** by using fixed-height bottom section:
   ```tsx
   {/* Bottom action area */}
   <div className="shrink-0 w-full h-[140px] md:h-[170px] flex flex-col justify-start items-center pt-4 md:pt-6">
     {!showCooldown && onGuess ? (
       <GuessButtons onGuess={onGuess} disabled={guessDisabled} />
     ) : null}
   </div>
   ```

### AbilityIcon.tsx Changes

**Goal:** Add ability name as tooltip header

Update tooltip content to include ability name prominently:
```tsx
<TooltipContent>
  <h3 className="font-bold text-gold uppercase tracking-wide mb-1">{name}</h3>
  <p className="text-foreground/80">{description}</p>
</TooltipContent>
```

---

## Phase 2: Button Style Revert

### GuessButtons.tsx Changes

**Goal:** Match GameModeCard.tsx style - rectangular, gold border, transparent background

Replace desktop inline variant (lines 63-157) with:

```tsx
// Desktop inline layout - rectangular buttons matching home page theme
return (
  <div className="hidden md:flex flex-col gap-3 w-full max-w-sm lg:max-w-md">
    {/* HIGHER button - primary style */}
    <motion.button
      type="button"
      onClick={() => onGuess('higher')}
      disabled={disabled}
      whileHover={!prefersReducedMotion && !disabled ? { x: 4 } : undefined}
      whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="
        relative flex items-center justify-center gap-3
        px-8 py-5 lg:py-6
        bg-gradient-to-b from-black/50 to-black/60
        backdrop-blur-sm
        border border-gold/50
        hover:border-gold
        hover:shadow-[0_0_20px_rgba(201,162,39,0.3)]
        text-gold font-bold text-lg lg:text-xl uppercase tracking-wider
        transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {/* Corner accents */}
      <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-gold" />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-gold" />
      <ChevronUp className="w-6 h-6" strokeWidth={3} />
      Higher
    </motion.button>

    {/* LOWER button - secondary style */}
    <motion.button
      type="button"
      onClick={() => onGuess('lower')}
      disabled={disabled}
      whileHover={!prefersReducedMotion && !disabled ? { x: 4 } : undefined}
      whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="
        relative flex items-center justify-center gap-3
        px-8 py-5 lg:py-6
        bg-gradient-to-b from-black/50 to-black/60
        backdrop-blur-sm
        border border-gold/30
        hover:border-gold/60
        hover:shadow-[0_0_16px_rgba(201,162,39,0.15)]
        text-foreground font-bold text-lg lg:text-xl uppercase tracking-wider
        transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-gold/30 group-hover:border-gold/60" />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-gold/30 group-hover:border-gold/60" />
      <ChevronDown className="w-6 h-6" strokeWidth={3} />
      Lower
    </motion.button>
  </div>
)
```

**Key style changes:**
- Remove all `clipPath` usage
- Remove gradient fills on buttons
- Use `border border-gold/50` instead
- Background: `bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm`
- Hover: `whileHover={{ x: 4 }}` (slide right like GameModeCard)
- Add corner accents with simple CSS borders

---

## Phase 3: Status Bar Simplification

### CooldownClash.tsx Header Changes

**Goal:** Simplify to match home page, semi-transparent with hover feedback

Replace angular header (around lines 392-465) with:

```tsx
<header className="absolute top-0 left-0 right-0 z-30 px-3 md:px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
  <div className="
    relative flex items-center justify-between
    px-4 md:px-6 py-2 md:py-3
    bg-gradient-to-b from-black/60 to-black/70
    backdrop-blur-md
    border border-gold/30
    hover:border-gold/50
    transition-colors duration-200
  ">
    {/* Corner accents */}
    <div className="absolute -top-px -left-px w-4 h-4 border-t border-l border-gold/60" />
    <div className="absolute -top-px -right-px w-4 h-4 border-t border-r border-gold/60" />
    <div className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-gold/60" />
    <div className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-gold/60" />

    {/* Back button - simple rectangular */}
    <Link href="/" className="p-2 text-foreground/60 hover:text-foreground transition-colors">
      <ArrowLeft className="w-5 h-5" />
    </Link>

    <ScoreDisplay score={state.score} highScore={state.highScore} lives={state.lives} />

    <div className="w-9 md:w-10" /> {/* Spacer for balance */}
  </div>
</header>
```

Remove the `AngularCorner` component usage entirely.

### ScoreDisplay.tsx Changes

**Goal:** Remove angular clip-paths from StatBlock

Update `StatBlock` component:
```tsx
function StatBlock({ label, value, variant = 'default' }) {
  const isGold = variant === 'gold'
  return (
    <div className="relative flex flex-col items-center px-4 md:px-5 py-1.5 md:py-2">
      <div className={cn(
        "absolute inset-0 rounded-sm",
        isGold
          ? "bg-gold/10 border border-gold/30"
          : "bg-black/20 border border-gold/20"
      )} />
      <span className="relative text-[9px] md:text-[10px] text-gold/60 uppercase tracking-[0.2em]">{label}</span>
      <span className={`relative text-lg md:text-xl font-bold ${isGold ? 'text-gold' : 'text-foreground'}`}>{value}</span>
    </div>
  )
}
```

---

## Phase 4: Level Pips Visibility

### LevelPips.tsx Changes

**Goal:** Better contrast on dark backgrounds

```tsx
export function LevelPips({ level, slot }: LevelPipsProps) {
  const maxLevel = slot === 'R' ? 3 : slot === 'P' ? 1 : 5

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm border border-gold/30 rounded-sm">
      <span className="text-xs text-gold/60 uppercase tracking-wider mr-1">Lv</span>
      {Array.from({ length: maxLevel }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-2.5 h-2.5 md:w-3 md:h-3 rotate-45 transition-all duration-200",
            i < level
              ? "bg-gradient-to-br from-[#f5e8a3] via-gold to-[#a88a1f] shadow-[0_0_8px_rgba(201,162,39,0.8)]"
              : "bg-black/50 border border-gold/40"
          )}
        />
      ))}
    </div>
  )
}
```

**Key changes:**
- Add dark background with blur for consistent contrast
- Add gold border around container
- Increase glow intensity on filled pips (0.7 → 0.8)
- Stronger border on unfilled pips (gold/20 → gold/40)
- Add "Lv" label for context
- Remove angular hexagon clip-path, use simple rounded corners

---

## Phase 5: VS Button

**Decision:** Keep current gold circle as-is. Will iterate on this separately in a future update.

---

## Verification Steps

1. **Run dev server:** `npm run dev`
2. **Navigate to:** `localhost:3000/play/random`
3. **Visual checks:**
   - Content (champion name, icon, pips) positioned in lower half of panels
   - Champion faces visible in upper portion of splash art
   - Buttons match home page style (rectangular, gold border, x:4 hover)
   - Ability name only appears on hover/tap (in tooltip)
   - Status bar is semi-transparent with corner accents
   - Level pips have better contrast on all backgrounds
   - Left and right panels have consistent vertical alignment
4. **Test interactions:**
   - Hover on ability icon shows tooltip with ability name
   - Button hover/tap animations work correctly
   - Score updates animate properly
   - Game flow (guess → reveal → transition) works smoothly
5. **Compare to home page:** Ensure visual consistency with `localhost:3000`

---

## Implementation Order

1. **SplitPanel.tsx** - Layout changes (biggest impact)
2. **GuessButtons.tsx** - Button style revert
3. **CooldownClash.tsx** - Header simplification
4. **ScoreDisplay.tsx** - Remove angular styling
5. **LevelPips.tsx** - Visibility improvements
6. **AbilityIcon.tsx** - Tooltip enhancement

Use `/frontend-design` skill for all UI work to maintain design quality.
