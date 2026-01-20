# Image Loading Performance Analysis

## Summary

Investigation into slow image loads when fetching champion thumbnails and splash art from CDragon.

---

## Current Architecture

### Data Flow
1. **Seed time**: `src/scripts/seed.ts` fetches champion data from CDragon API and stores normalized image URLs in PostgreSQL
2. **Runtime**: Components fetch images directly from CDragon CDN via Next.js `<Image>` component
3. **Preloading**: `useImagePreloader` hook attempts to warm browser cache for next round

### Key Files
- `src/components/game/AbilityCard.tsx` - Card layout with splash background
- `src/components/game/SplitPanel.tsx` - Full-screen panel with splash background
- `src/lib/hooks/useImagePreloader.ts` - Browser cache preloader
- `next.config.ts` - Remote image patterns config

### Image Types & Sizes (Approximate)
| Type | Count | Size Each | Total |
|------|-------|-----------|-------|
| Champion icons | ~170 | ~20KB | ~3MB |
| Ability icons | ~850 | ~15KB | ~12MB |
| Splash art | ~170 | ~500KB-1MB | ~100-170MB |

---

## Problems Identified

### 1. Ineffective Preloader (Critical)
**File**: `src/lib/hooks/useImagePreloader.ts`

The preloader fetches raw CDragon URLs:
```typescript
const img = new window.Image()
img.src = url  // e.g., https://raw.communitydragon.org/...
```

But the `<Image>` component fetches optimized images from:
```
/_next/image?url=https://raw.communitydragon.org/...&w=1920&q=75
```

**Result**: Preloading does nothing useful. The browser caches the raw URL, but Next.js requests a different URL entirely.

### 2. Splash Art Loaded with `priority`
**Files**: `AbilityCard.tsx:42`, `SplitPanel.tsx:53`

```tsx
<Image
  src={champion.splash}
  priority  // <-- Blocks rendering
  ...
/>
```

Splash art (~500KB-1MB) is marked as priority, blocking the initial render. These are decorative backgrounds shown at 30% opacity.

### 3. Missing `sizes` Prop
All `<Image>` components use `fill` without `sizes`:

```tsx
<Image src={...} fill className="object-cover" />
```

Without `sizes`, Next.js may fetch larger images than needed for the viewport.

### 4. No Quality Reduction for Backgrounds
Splash art displayed at 30% opacity still loads at default quality (75). A much lower quality would be visually identical.

### 5. No Blur Placeholders
No `placeholder="blur"` or `blurDataURL` for perceived performance during load.

---

## Recommendations

### Quick Wins (No Infrastructure Changes)

#### 1. Fix the Preloader
Generate Next.js-compatible URLs for preloading:

```typescript
// Helper to generate the URL that <Image> will actually request
function getNextImageUrl(src: string, width: number, quality = 75) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}

// In preloader
img.src = getNextImageUrl(url, 1920, 50)
```

#### 2. Remove `priority` from Splash Art
```tsx
<Image
  src={champion.splash}
  // Remove: priority
  loading="lazy"  // Or just omit, lazy is default
  ...
/>
```

#### 3. Add `sizes` Prop
```tsx
<Image
  src={champion.splash}
  fill
  sizes="100vw"  // Full-width background
  ...
/>

<Image
  src={champion.icon}
  fill
  sizes="96px"  // 24x24 = w-24 in Tailwind
  ...
/>
```

#### 4. Lower Quality for Splash Backgrounds
```tsx
<Image
  src={champion.splash}
  quality={40}  // Barely visible at 30% opacity anyway
  ...
/>
```

#### 5. Add Blur Placeholders
Option A - Static blur (simple):
```tsx
<Image
  src={champion.splash}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."  // Tiny base64
  ...
/>
```

Option B - Generate blur hashes at seed time and store in DB.

### Considered & Rejected

#### Local Image Caching (Redis)
- **Why considered**: Eliminate CDragon latency
- **Why rejected**: Redis is memory-based, storing ~120-180MB of images is expensive and inefficient. Redis is better suited for small key-value data.

#### Download Images at Seed Time
- **Why considered**: Zero runtime dependency on CDragon
- **Why rejected**: ~120-180MB added to repo/deployment. Requires re-seeding for updates.

#### Lazy Filesystem Cache
- **Why considered**: Cache on first request, serve locally after
- **Why rejected**: Adds complexity (cache invalidation, storage management) for marginal benefit over fixing the preloader.

---

## Implementation Priority

1. **Fix preloader** - Biggest impact, preloading currently does nothing
2. **Remove `priority` from splash** - Stop blocking render on large images
3. **Add `sizes` props** - Fetch appropriate sizes
4. **Lower splash quality** - Reduce payload for decorative images
5. **Blur placeholders** - Nice-to-have for perceived performance

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/hooks/useImagePreloader.ts` | Generate Next.js image URLs |
| `src/components/game/AbilityCard.tsx` | Remove priority, add sizes/quality |
| `src/components/game/SplitPanel.tsx` | Remove priority, add sizes/quality |
| `next.config.ts` | Optionally configure image device sizes |

---

## Testing

After implementing:
1. Open Network tab in DevTools
2. Filter by "Img"
3. Verify preloaded URLs match actual `<Image>` requests
4. Check image sizes being fetched match expected dimensions
5. Measure Largest Contentful Paint (LCP) before/after
