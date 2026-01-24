# Visual Refresh: Game Page (/play/random)

Polish the gameplay page to match the home page aesthetic while keeping the existing layout intact.

## Design Philosophy

Apply **purposeful micro-interactions** — small animations (200-400ms) that clarify, guide, or confirm. Every effect must serve a function: depth, focus, or feedback. Subtlety creates elegance.

**Timing goal:** Speed things up for snappier gameplay.

Key patterns from home page:
- Gold glow effects: `shadow-[0_0_20px_rgba(227,207,116,0.2)]`
- Corner bracket decorations (see `GameModeCard.tsx`)
- Text shadows: `0 0 40px rgba(227,207,116,0.3)`
- Spring physics: `stiffness: 400, damping: 25-30`
- Staggered entrance animations

---

## Changes by Component

### 1. ScoreDisplay.tsx (Status Bar)

**Current:** Basic pill with `bg-dark-blue/80 rounded-full border-white/10`

**Changes:**
- Replace `rounded-full` → `rounded-lg` for refined look
- Add gold border: `border-gold/30`
- Add subtle glow: `shadow-[0_0_12px_rgba(227,207,116,0.15)]`
- Add corner bracket decorations (top-left, bottom-right)
- Add entrance fade animation on mount

### 2. Back Button (in CooldownClash.tsx header)

**Current:** Basic 40px link with ArrowLeft icon

**Changes:**
- Add gold border: `border border-gold/30`
- Add hover glow: `hover:shadow-[0_0_12px_rgba(227,207,116,0.2)]`
- Wrap with `motion.div` for `whileHover={{ scale: 1.05 }}` and `whileTap={{ scale: 0.95 }}`
- Match styling to ScoreDisplay container

### 3. GameOver.tsx (Modal)

**Current:** Basic Dialog with CSS `animate-pulse` on high score text

**Changes:**
- Add corner bracket decorations (larger: `w-4 h-4 border-2`)
- Add modal glow: `shadow-[0_0_30px_rgba(227,207,116,0.2)]`
- Add text shadow on "Game Over" title
- Replace `animate-pulse` with Framer Motion gold shimmer (oscillating `textShadow`)
- Add `numberPop` animation on final score reveal
- Add staggered entrance for content elements
- Subtle gold glow pulse on "New High Score!" text (no particles, keep it elegant)

### 4. VsDivider.tsx

**Current:** Gold circle with static glow

**Changes:**
- Add breathing glow animation (subtle 3s loop, oscillating shadow opacity)
- Add inner ring detail for depth
- Add entrance scale animation (`initial={{ scale: 0.8, opacity: 0 }}`)
- Convert to client component with `useReducedMotion`

### 5. GuessButtons.tsx

**Current:** Functional but basic hover states

**Changes (Desktop):**
- Higher button: Add glow `shadow-[0_0_16px_rgba(227,207,116,0.3)]`, intensify on hover
- Lower button: Add gold border accent `border-gold/30`, glow on hover

**Changes (Mobile):**
- Add backdrop blur to container
- Match glow effects from desktop

### 6. SplitPanel.tsx

**Current:** Splash background with dark overlay, basic text

**Changes:**
- Add text shadow on champion name: `textShadow: '0 0 40px rgba(227,207,116,0.25)'`
- Add vignette overlay: `bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]`
- Enhance cooldown number glow: `textShadow: '0 0 40px rgba(227,207,116,0.5)'`
- Add gold border accent on level badge: `border border-gold/40`

### 7. Motion Variants (variants.ts)

**Add new variants:**
```ts
// Staggered container for game page elements
gameContainerVariants: { staggerChildren: 0.1, delayChildren: 0.15 }

// Gold glow pulse for celebration
goldGlowPulse: oscillating textShadow (2s loop)
```

### 8. Timing Adjustments (CooldownClash.tsx)

**Current timings feel slightly slow — speed up for snappier gameplay:**

| Constant | Current | New | Purpose |
|----------|---------|-----|---------|
| `REVEAL_DELAY` | 1500ms | 1200ms | Time showing both cooldowns |
| `panelTransition` | 0.5s | 0.35s | Desktop panel slide |
| `mobilePanelTransition` | 0.4s | 0.3s | Mobile panel slide |
| `smoothTransition` | 0.3s | 0.25s | General tween animations |

**Rationale:** Faster transitions maintain engagement flow. Research shows 200-400ms is optimal for micro-interactions.

---

## Implementation Order

1. **variants.ts** — Add new motion variants first
2. **VsDivider.tsx** — Simple, isolated component (good test)
3. **ScoreDisplay.tsx** — Header polish with corner brackets
4. **GuessButtons.tsx** — Interactive element refinement
5. **SplitPanel.tsx** — Text shadows, vignette, level badge
6. **CooldownClash.tsx** — Back button enhancement
7. **GameOver.tsx** — Full modal polish (most complex)

---

## Critical Files

| File | Purpose |
|------|---------|
| `src/lib/motion/variants.ts` | Add new motion variants |
| `src/components/game/ScoreDisplay.tsx` | Status bar polish |
| `src/components/game/GameOver.tsx` | Modal redesign |
| `src/components/game/VsDivider.tsx` | VS badge animation |
| `src/components/game/GuessButtons.tsx` | Button glow effects |
| `src/components/game/SplitPanel.tsx` | Text shadows, vignette |
| `src/components/game/CooldownClash.tsx` | Back button + timing constants |
| `src/components/home/GameModeCard.tsx` | Reference for corner brackets |

---

## Verification

1. Run `npm run dev` and open `/play/random`
2. Check entrance animations on page load
3. Play a round — verify guess feedback feels smooth
4. Lose all lives — verify GameOver modal animations
5. Achieve new high score — verify celebration effect
6. Test with `prefers-reduced-motion: reduce` in browser DevTools
7. Test on mobile Safari (most restrictive)
8. Verify 44px minimum tap targets on mobile

---

## Sources

- [Micro-interactions & Motion Graphics as UX Game-Changers](https://marsmatics.com/micro-interactions-motion-graphics-as-ux-game-changers/)
- [Motion UI Trends 2026](https://lomatechnology.com/blog/motion-ui-trends-2026/2911)
- [10 Best Micro-interaction Examples](https://www.designstudiouiux.com/blog/micro-interactions-examples/)
- [Aceternity UI](https://ui.aceternity.com/) — Framer Motion component collection
