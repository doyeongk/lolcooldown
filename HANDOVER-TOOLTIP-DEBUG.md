# Tooltip Positioning Debug - Handover for Claude in Chrome

## Problem

Desktop tooltip on ability icons appears at the wrong position (far left of panel) instead of being anchored above the ability icon with arrow pointing down.

## What We Tried

1. Updated CSS animation keyframes in `src/app/globals.css` to include full transform:
   ```css
   @keyframes tooltip-fade-in {
     from {
       opacity: 0;
       transform: translate(-50%, calc(-100% + 4px));
     }
     to {
       opacity: 1;
       transform: translate(-50%, -100%);
     }
   }
   ```

2. Added 8px gap for arrow in `src/components/game/AbilityIcon.tsx`:
   ```typescript
   setTooltipPosition({
     top: rect.top - 8,
     left: rect.left + rect.width / 2,
   })
   ```

## Still broken - needs investigation

## What to Investigate in DevTools

1. **Hover over an ability icon** on desktop to trigger the tooltip

2. **Inspect the tooltip element** - it should have:
   - Class: `animate-tooltip-fade-in`
   - Inline styles: `top`, `left`, `transform`

3. **Check Computed Styles tab**:
   - What is the final computed `transform` value?
   - Is the animation overriding the inline style?
   - What are the computed `top` and `left` values?

4. **Check the Elements panel**:
   - Is the tooltip a direct child of `<body>` or nested inside a container?
   - Are there any parent elements with `transform` that could affect positioning?
   - Is the tooltip using `position: fixed`?

5. **Check Animation panel** (if available):
   - Pause the animation and step through keyframes
   - See what transform values are being applied at each step

6. **Compare expected vs actual**:
   - The tooltip should appear ABOVE the ability icon
   - Arrow should point DOWN, centred on the icon
   - `left` should be horizontally centred on the icon
   - `top` should place the tooltip above the icon

## Key Questions to Answer

1. What is the actual computed `transform` on the tooltip when visible?
2. Is `animation-fill-mode: forwards` causing the animation's final transform to override inline styles?
3. Are there any containing blocks (parent with transform/filter/perspective) affecting fixed positioning?
4. What are the actual pixel values for top/left vs where the icon actually is?

## File Locations

- CSS animation: `src/app/globals.css` lines 144-153
- Tooltip component: `src/components/game/AbilityIcon.tsx` lines 156-174
- Tooltip positioning logic: `src/components/game/AbilityIcon.tsx` lines 59-68
