# Game Over Modal - High Score Celebration

## Overview
Enhance the game over modal with celebratory animations when a new high score is achieved.

## Requirements
1. Trophy/crown icon that animates in with a bounce effect
2. Animated count-up of high score from old value to new value
3. Respect reduced motion preferences

## Implementation Notes

### Trophy Icon
- Use `Trophy` from lucide-react
- Spring bounce animation (scale 0 → 1, slight rotation)
- Gold color with glow effect: `drop-shadow-[0_0_10px_rgba(201,162,39,0.6)]`
- Position above "New High Score!" text

### Count-up Animation
- Create `useCountUp(target, start, duration, enabled)` hook
- Tick interval calculated from duration / steps
- Only animate when `isNewHighScore && !prefersReducedMotion`

### Required Changes

**GameOver.tsx:**
- Add `previousHighScore: number` prop
- Import `Trophy` from lucide-react
- Add `useCountUp` hook
- Add trophy animation variant
- Display `displayedHighScore` instead of `highScore`

**CooldownClash.tsx:**
- Track `sessionStartHighScore` (already done for status bar)
- Pass `previousHighScore={sessionStartHighScore}` to GameOver

## Previous Attempt Issues
- Trophy icon wasn't rendering (investigate AnimatePresence/variants conflict)
- May need to test variants without conditional wrapper
- Check if Trophy component needs explicit size/viewBox

## Testing
1. Clear localStorage to reset high score
2. Play game, get a score
3. Play again, beat the score
4. Verify trophy appears and count-up animates
5. Test with `prefers-reduced-motion: reduce` in dev tools
