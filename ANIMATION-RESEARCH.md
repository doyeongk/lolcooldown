# Animation Research Compendium

Comprehensive research on web animations, compiled January 2026. Covers Emil Kowalski's principles, CSS View Transitions API, carousel patterns, and Motion library.

---

## Table of Contents

1. [Emil Kowalski's Animation Philosophy](#emil-kowalskis-animation-philosophy)
2. [Duration Guidelines](#duration-guidelines)
3. [Easing Functions](#easing-functions)
4. [Carousel/Slide Transition Patterns](#carouselslide-transition-patterns)
5. [CSS View Transitions API](#css-view-transitions-api)
6. [Motion Library (Framer Motion)](#motion-library-framer-motion)
7. [FLIP Technique](#flip-technique)
8. [Performance Considerations](#performance-considerations)
9. [Accessibility](#accessibility)
10. [Sources](#sources)

---

## Emil Kowalski's Animation Philosophy

Emil Kowalski is a Design Engineer at Linear (previously Vercel) and creator of [animations.dev](https://animations.dev/). His philosophy centres on animations that "make people feel something" — not just technical implementation, but understanding the *why* behind motion design.

### Core Principles

1. **Purpose over decoration**: Every animation should serve a purpose — guiding attention, providing feedback, or creating spatial continuity.

2. **Keep it under 300ms**: Anything longer feels sluggish. For frequently-repeated interactions (100+ times daily), consider removing animation entirely.

3. **Origin-aware animations**: Elements should animate from where they logically come from. Dropdowns animate from their trigger button, not from nowhere.

4. **Don't animate from scale(0)**: "Elements that animate from scale(0) can make an animation feel off. Try animating from a higher initial scale instead (0.9+). It makes the movement feel more gentle, natural, and elegant."

5. **Use blur to mask imperfections**: When animation timing isn't perfect, `filter: blur(2px)` can "bridge the visual gap between old and new states."

6. **Spring animations feel natural**: "I highly suggest playing around with spring animations in your projects" — springs provide organic, physics-based motion that feels more natural than bezier curves.

---

## Duration Guidelines

| Context | Recommended Duration |
|---------|---------------------|
| **General UI animations** | Under **300ms** |
| **Elements entering screen** | 250–300ms |
| **Elements exiting screen** | 200–250ms (slightly shorter) |
| **Button press feedback** | **150ms** with scale 0.97 |
| **Fast spinners** | **180ms** feels more responsive than 400ms |
| **Stagger delays** | **0.05–0.2s** between children |
| **Carousel slides** | 300-500ms |
| **Page transitions** | 500-700ms |
| **Tooltip fade** | 200ms |
| **Modal/sheet entrance** | 300ms |

### Key Insight

Exit animations should be slightly faster than enter animations. Users have already committed to an action when something exits, so they don't need as much time to process it.

---

## Easing Functions

### The Easing Decision Framework

From [animations.dev](https://animations.dev/learn/animation-theory/the-easing-blueprint):

| Question | Easing to Use |
|----------|---------------|
| Is element **entering or exiting**? | `ease-out` |
| Is element **moving on-screen**? | `ease-in-out` |
| Is it a **hover/colour transition**? | `ease` |
| Will users see this **100+ times daily**? | Don't animate |

### Why `ease-out` is the Default

- Accelerates at the start, decelerates at the end
- Creates perception of responsiveness and speed
- A 300ms `ease-out` feels faster than 300ms `ease-in` despite identical duration
- Objects in the real world slow down as they approach their destination (friction)

### Avoid `ease-in` for UI

- Starts slow, ends fast
- Feels sluggish and unresponsive
- "Not made for UI animations"
- Only appropriate for elements leaving the viewport (accelerating away)

### Custom Easing Curves

Built-in CSS easings are "usually not strong enough". Emil recommends using [easings.co](https://easings.co) or easing.dev for custom curves.

Example custom curves from animations.dev:
```css
--ease-breeze: cubic-bezier(.55, .085, .68, .53);
--ease-silk: cubic-bezier(.52, .062, .64, .21);
--ease-swift: cubic-bezier(.86, .04, .67, .24);
```

### Common Cubic Bezier Values

```css
/* Snappy ease-out (recommended for UI) */
cubic-bezier(0.16, 1, 0.3, 1)

/* Smooth ease-in-out */
cubic-bezier(0.65, 0, 0.35, 1)

/* Bouncy spring-like */
cubic-bezier(0.34, 1.56, 0.64, 1)

/* iOS-style */
cubic-bezier(0.25, 0.1, 0.25, 1)
```

---

## Carousel/Slide Transition Patterns

### The Pattern: Right → Left + New from Right

For a carousel where:
1. The RIGHT item slides to become the LEFT item
2. A NEW item slides in from the right to fill the empty space
3. This happens simultaneously

#### Pure CSS Approach

```css
/* Base styles */
.carousel-item {
  position: absolute;
  width: 50%;
  transition: transform 400ms ease-out, opacity 300ms ease-out;
}

/* Position states */
.carousel-item--left {
  transform: translateX(0);
  opacity: 1;
}

.carousel-item--right {
  transform: translateX(100%);
  opacity: 1;
}

/* Entering from off-screen right */
.carousel-item--entering {
  transform: translateX(200%);
  opacity: 0;
}

/* Exiting to off-screen left */
.carousel-item--exiting {
  transform: translateX(-100%);
  opacity: 0;
}
```

#### React Implementation Pattern

```tsx
const [leftIndex, setLeftIndex] = useState(0);
const [rightIndex, setRightIndex] = useState(1);
const [isAnimating, setIsAnimating] = useState(false);

const advance = () => {
  if (isAnimating) return;
  setIsAnimating(true);

  // After animation completes, update indices
  setTimeout(() => {
    setLeftIndex(rightIndex);
    setRightIndex((rightIndex + 1) % items.length);
    setIsAnimating(false);
  }, 400); // Match CSS transition duration
};
```

#### Three-Element Technique

During transition, render THREE elements:
1. **Current left** (exiting to off-screen left)
2. **Current right** (moving to left position)
3. **New item** (entering from off-screen right)

This creates smooth visual continuity.

### Simultaneous vs Staggered Timing

For two items moving together in a carousel:

**Simultaneous (recommended):**
- Both items start at the same time
- Same duration and easing
- Creates a cohesive "sliding panel" effect

**Staggered (alternative):**
- 50-100ms delay on the incoming item
- Creates a "follow" effect
- Can feel disconnected for side-by-side comparisons

### react-transition-group Pattern

```css
/* Enter: new item sliding in from right */
.slide-enter {
  transform: translateX(100%);
  opacity: 0;
}
.slide-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: transform 400ms ease-out, opacity 300ms ease-out;
}

/* Exit: old item sliding out to left */
.slide-exit {
  transform: translateX(0);
  opacity: 1;
}
.slide-exit-active {
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 400ms ease-out, opacity 300ms ease-out;
}
```

---

## CSS View Transitions API

### Browser Support (2025-2026)

**Same-document transitions (SPA):**
- Chrome 111+ (stable since March 2023)
- Edge 111+
- Safari 18+ (September 2024)
- Firefox 144 (shipping October 14, 2025)
- ~85-90% global browser support

**Cross-document transitions (MPA):**
- Chrome 126+, Edge 126+, Safari 18.2+
- Firefox: Not yet supported

### Basic Usage

```javascript
document.startViewTransition(() => {
  // Update DOM here
  updateTheDOM();
});
```

### Shared Element Transitions

Give the same `view-transition-name` to elements in different states:

```css
.left-position {
  view-transition-name: carousel-item;
}

.right-position {
  view-transition-name: carousel-item;
}
```

```javascript
document.startViewTransition(() => {
  element.classList.remove('right-position');
  element.classList.add('left-position');
});
```

### Custom Sliding Animations

```css
::view-transition-old(.slide-left) {
  animation: slide-out-left 300ms ease-out forwards;
}

::view-transition-new(.slide-left) {
  animation: slide-in-left 300ms ease-out forwards;
}

@keyframes slide-out-left {
  to { transform: translateX(-100%); opacity: 0; }
}

@keyframes slide-in-left {
  from { transform: translateX(100%); opacity: 0; }
}
```

### React Integration (Experimental)

React has experimental `<ViewTransition>` support in `react@canary`:

```jsx
import { ViewTransition, startTransition } from 'react';

function Carousel({ items, currentIndex }) {
  const [index, setIndex] = useState(currentIndex);

  const navigate = (direction) => {
    startTransition(() => {
      addTransitionType(direction > 0 ? 'nav-forward' : 'nav-back');
      setIndex(prev => prev + direction);
    });
  };

  return (
    <ViewTransition
      name="carousel-item"
      share={{
        'nav-forward': 'slide-left',
        'nav-back': 'slide-right',
      }}
    >
      <div className="carousel-item">
        {items[index]}
      </div>
    </ViewTransition>
  );
}
```

### Next.js Integration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
```

### Feature Detection Fallback

```javascript
function updateWithTransition(updateFn) {
  if (!document.startViewTransition) {
    updateFn();
    return;
  }
  document.startViewTransition(updateFn);
}
```

---

## Motion Library (Framer Motion)

### AnimatePresence for Exit Animations

```jsx
import { motion, AnimatePresence } from "motion/react"

const Slideshow = ({ image }) => (
  <AnimatePresence>
    <motion.img
      key={image.src}  // Changing key triggers exit/enter cycle
      src={image.src}
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
    />
  </AnimatePresence>
)
```

**Critical points:**
- Direct children must have unique `key` props
- The key change triggers the exit animation before re-render
- `AnimatePresence` must remain mounted — only children should conditionally render

### Layout Animations with `layoutId`

For shared element transitions (element moving from A to B):

```jsx
// Two elements with same layoutId animate between each other
<motion.div layoutId="shared-panel" style={{ gridColumn: isSwapped ? 2 : 1 }}>
  Content A
</motion.div>
```

When a new component appears with matching `layoutId`, Motion automatically animates from the old position to the new one — even if they're in different parts of the DOM.

### Simple Layout Animation

```jsx
<motion.div
  layout  // Enables automatic layout animation
  style={{ justifyContent: isFlipped ? 'flex-end' : 'flex-start' }}
>
  {content}
</motion.div>
```

Any layout change from a React render is automatically animated.

### Staggered Children

```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.5,
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i} variants={item} />)}
</motion.ul>
```

### Bundle Size

| Configuration | Size (gzipped) |
|--------------|----------------|
| Full `motion` component | ~34kb |
| `LazyMotion` + `domAnimation` | ~15kb |
| `LazyMotion` + `domMax` | ~25kb (required for layout animations) |
| `m` component + lazy features | ~4.6kb initial |

### Minimal Setup with LazyMotion

```jsx
import { LazyMotion, domMax, m } from "motion/react"

function App() {
  return (
    <LazyMotion features={domMax}>
      <m.div layout layoutId="a" />
      <m.div layout layoutId="b" />
    </LazyMotion>
  )
}
```

---

## FLIP Technique

FLIP = First, Last, Invert, Play

### How It Works

1. **First**: Record element's initial position/size
2. **Last**: Update DOM, record new position/size
3. **Invert**: Apply transform to make element appear in original position
4. **Play**: Animate the transform to zero (letting element settle into new position)

### When to Use FLIP

**Good for:**
- Elements already in the DOM changing position
- List reordering
- Expanding/collapsing cards

**Not ideal for:**
- Enter/exit animations (no "First" position for new elements)
- Simple carousel slides (transforms are simpler)

### Implementation

```javascript
// Manual FLIP
const first = element.getBoundingClientRect();

// Make DOM change
updateDOM();

const last = element.getBoundingClientRect();

// Invert
const deltaX = first.left - last.left;
const deltaY = first.top - last.top;

element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

// Play
requestAnimationFrame(() => {
  element.style.transition = 'transform 300ms ease-out';
  element.style.transform = '';
});
```

### Libraries

- **react-flip-toolkit**: Lightweight FLIP animations for React
- **Motion**: Built-in FLIP via `layout` prop

---

## Performance Considerations

### Only Animate Transform and Opacity

These properties only trigger the **composite** step, not layout or paint:

```css
/* Good - GPU accelerated */
transform: translateX(100px);
opacity: 0.5;

/* Avoid - triggers layout */
left: 100px;
width: 200px;
margin-left: 100px;
```

### will-change Hint

```css
.animated-element {
  will-change: transform, opacity;
}
```

Use sparingly — over-use can hurt performance.

### CSS vs JS Animations

- **CSS transitions**: Stay smooth during main-thread congestion
- **Web Animation API**: Same performance as CSS
- **JS-driven (requestAnimationFrame)**: Can jank if main thread is busy

### Avoid Layout Thrashing

Don't interleave reads and writes:

```javascript
// Bad - forces layout recalculation each iteration
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = height + 10 + 'px'; // Write
});

// Good - batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';
});
```

---

## Accessibility

### Respect Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Or target specific animations:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-left,
  .animate-slide-right {
    animation: none;
  }
}
```

### React Hook

```jsx
import { useReducedMotion } from "motion/react"

function Component() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ x: shouldReduceMotion ? 0 : 100 }}
    />
  );
}
```

### Auto-Playing Carousels

- Provide pause controls
- Keep animations under 5 seconds or provide stop controls
- Consider not auto-playing at all

---

## Tooltip Delay Pattern

Skip the delay and animation when hovering between tooltips after first activation:

```css
[data-instant] {
  transition-duration: 0ms;
}
```

This prevents annoying delays when users are quickly scanning multiple tooltips.

---

## Sources

### Emil Kowalski / animations.dev
- [animations.dev](https://animations.dev/)
- [animations.dev - The Easing Blueprint](https://animations.dev/learn/animation-theory/the-easing-blueprint)
- [Great Animations](https://emilkowal.ski/ui/great-animations)
- [7 Practical Animation Tips](https://emilkowal.ski/ui/7-practical-animation-tips)
- [Good vs Great Animations](https://emilkowal.ski/ui/good-vs-great-animations)

### View Transitions API
- [What's new in view transitions (2025 update) - Chrome for Developers](https://developer.chrome.com/blog/view-transitions-in-2025)
- [View Transition API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [Smooth transitions with the View Transition API - Chrome for Developers](https://developer.chrome.com/docs/web-platform/view-transitions)
- [Misconceptions about view transitions - Chrome for Developers](https://developer.chrome.com/blog/view-transitions-misconceptions)
- [Can I use: View Transitions API](https://caniuse.com/view-transitions)

### React/Next.js View Transitions
- [React Labs: View Transitions, Activity, and more](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more)
- [ViewTransition - React Documentation](https://react.dev/reference/react/ViewTransition)
- [next.config.js: viewTransition - Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition)
- [next-view-transitions - GitHub](https://github.com/shuding/next-view-transitions)

### Motion Library
- [Motion Layout Animations Documentation](https://motion.dev/docs/react-layout-animations)
- [AnimatePresence Documentation](https://motion.dev/docs/react-animate-presence)
- [Motion Transitions](https://motion.dev/docs/react-transitions)
- [Motion Stagger](https://motion.dev/docs/stagger)
- [Reduce Bundle Size Guide](https://motion.dev/docs/react-reduce-bundle-size)
- [Maxime Heckel's Layout Animations Guide](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/)

### Carousel Patterns
- [CSS-Tricks: Everything You Need to Know About FLIP Animations in React](https://css-tricks.com/everything-you-need-to-know-about-flip-animations-in-react/)
- [CSS-Tricks: Animating Layouts with FLIP](https://css-tricks.com/animating-layouts-with-the-flip-technique/)
- [Josh Comeau: Animating the Unanimatable](https://www.joshwcomeau.com/react/animating-the-unanimatable/)
- [DEV: CSS Transitions in React - Root Beer Carousel](https://dev.to/cooljasonmelton/css-transitions-in-react-build-a-root-beer-carousel-1mnb)
- [DEV: Build a CSS Animated React Carousel Component](https://dev.to/morewings/from-scratch-build-a-css-animated-react-carousel-component-5fhk)
- [Smashing Magazine: Designing Better Carousel UX](https://www.smashingmagazine.com/2022/04/designing-better-carousel-ux/)

### Performance
- [NN/G: Animation Duration and Motion Characteristics](https://www.nngroup.com/articles/animation-duration/)
- [Medium: Should I animate with Left or TranslateX?](https://medium.com/@iamryanyu/should-i-do-the-animation-with-left-or-translatex-49b65a09cf38)

### Tools
- [easings.co](https://easings.co) - Custom easing curve generator
- [react-flip-toolkit - GitHub](https://github.com/aholachek/react-flip-toolkit)
