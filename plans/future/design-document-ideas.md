# Game Page Design Document

## Overview

This document describes the redesigned game page layout for the cooldown guessing game. The goal is to reduce cognitive load, minimize eye movement, and create a more fluid gameplay loop while maintaining the visual atmosphere established by the home page.

---

## Core Design Problem

The current layout requires too much eye movement and mental processing:
- Eyes are drawn to the ability icon (visually interesting but not decision-relevant)
- Ability name takes prime real estate but isn't read
- Level badge is always "Lv. 1" (pure noise)
- Buttons are far from the information needed to make a decision
- The interaction requires precise mouse targeting

The new design consolidates information and turns the entire right panel into the input mechanism.

---

## Layout Structure

The game area is split into two equal halves with a VS indicator at the center dividing line.

### Left Panel (Reference Side)

Displays the known ability with its cooldown revealed.

**Top zone:** Champion name and ability key (e.g., "WARWICK Q"). Small, subtle, serves as context only.

**Middle zone:** 
- Ability icon (smaller than current, serves as visual anchor)
- Cooldown value displayed prominently (this is the key information)
- Ability description text (now that we have space, helps players who don't have every ability memorized)

**Bottom zone:** Ability name rendered as decorative/atmospheric text. Large but low opacity, styled distinctively (serif, italic, or similar treatment). This is flavor, not information — "Jaws of the Beast" adds thematic resonance without demanding attention.

### Right Panel (Input Side)

Displays the unknown ability. The entire panel is the clickable input area.

**Top zone:** Champion name and ability key, matching the left side for symmetry.

**Middle zone:**
- Ability icon (same size as left)
- Question mark or hidden indicator where the cooldown would be
- Ability description text

**Bottom zone:** Ability name as decorative text, matching left side treatment.

**The interaction model:** 
- The panel is divided into vertical zones representing second differences
- Top of panel = guessing the unknown ability has a much higher cooldown
- Middle of panel = guessing they're roughly equal
- Bottom of panel = guessing the unknown ability has a much lower cooldown
- Vertical position maps to actual seconds: each zone represents approximately ±1 second from center, scaling outward (±1, ±2, ±3... up to ±20 or more at the extremes)

---

## Interaction Design

### Hover Feedback

When the mouse enters the right panel, visual feedback should indicate which zone the player is in:
- Background treatment shifts subtly based on vertical position
- Top region: warmer visual treatment (suggesting "higher")
- Bottom region: cooler visual treatment (suggesting "lower")
- The transition should be smooth and atmospheric, not jarring
- Consider subtle intensity changes toward the edges to indicate "extreme" guesses

### Zone Indication

A subtle indicator should show the current guess in seconds:
- Display the current ± second value based on mouse position
- Could also show the potential point multiplier for that guess
- Should not be visually dominant — the background shift is the primary feedback

### Click and Result

When the player clicks:
- The click position determines their guess (e.g., clicking near top = "+12 seconds")
- Visual feedback radiates from the click point
- Correct: green/positive fill effect
- Incorrect: red/negative fill effect
- The actual cooldown is revealed
- Brief pause, then transition to next round

### Scoring Logic

- Exact match: maximum points
- Close guess: partial points (scaled by how close)
- Wrong direction: penalty
- Bonus for speed (encourages confident play, discourages overthinking)

---

## Removed Elements

- **Level badge:** Always shows "Lv. 1", provides no information, removed entirely
- **Higher/Lower buttons:** Replaced by the click-anywhere input system
- **Large ability icons:** Scaled down, they identify the ability but shouldn't dominate

---

## Visual Hierarchy (Priority Order)

1. Cooldown value (left side) — the reference point for the decision
2. Click position feedback (right side) — where you're about to commit
3. Ability descriptions — helps inform the decision
4. Ability icons — quick visual identification
5. Champion names / ability keys — context
6. Decorative ability names — atmosphere

---

## Background Treatment

The champion splash art should be treated similarly to the home page:
- Darkened significantly 
- Consider blur or desaturation
- Inner edges (near the center divider) should be especially darkened to give the UI breathing room
- The art provides atmosphere, not information — it shouldn't compete with the UI

---

## Eye Flow

The intended eye movement pattern:

1. Glance at left middle (see cooldown: "6s")
2. Glance at right middle (see ability, read description if needed)
3. Move mouse to position representing guess
4. Click
5. See result
6. Next round loads, repeat

Eyes stay roughly horizontal. No vertical travel between information and buttons. The input IS the information zone.

---

## Responsive Considerations

On smaller screens or mobile:
- The same top/bottom division works for touch
- Tap position in the right panel determines the guess
- May need larger touch targets at the extremes
- Consider haptic feedback at zone boundaries

---

## Animation and Transitions

- Round transitions should feel smooth, not jarring
- The "result fill" animation should be quick but satisfying
- New round content can fade/slide in
- Maintain the atmospheric quality throughout — this is a vibe, not just a quiz
