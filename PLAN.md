# Plan: Fix All Linting Errors

## Summary

Fix 3 `react-hooks/set-state-in-effect` lint errors by replacing `useState` + `useEffect` patterns with `useSyncExternalStore` for external browser API synchronization (localStorage, matchMedia), and using a ref-based approach for Portal mounting detection.

## Files to Modify

1. **`src/components/ui/Portal.tsx`** - Replace `useState`/`useEffect` mounted pattern with `useSyncExternalStore` that tracks document availability
2. **`src/lib/hooks/useLocalStorage.ts`** - Rewrite using `useSyncExternalStore` to sync with localStorage
3. **`src/lib/hooks/useMediaQuery.ts`** - Rewrite using `useSyncExternalStore` to sync with `matchMedia`

## Implementation Order

### 1. Fix useMediaQuery.ts

Replace the current implementation with `useSyncExternalStore`:
- `subscribe`: Add/remove `change` event listener on `matchMedia`
- `getSnapshot`: Return `window.matchMedia(query).matches`
- `getServerSnapshot`: Return `false` (conservative SSR default)

### 2. Fix useLocalStorage.ts

Replace the current implementation with `useSyncExternalStore`:
- `subscribe`: Listen for `storage` events (for cross-tab sync)
- `getSnapshot`: Read from `localStorage` and parse JSON
- `getServerSnapshot`: Return `initialValue`
- `setValue`: Write to localStorage and dispatch storage event

### 3. Fix Portal.tsx

Replace mounted state with `useSyncExternalStore`:
- `subscribe`: Return no-op (document doesn't change)
- `getSnapshot`: Return `true` (client-side)
- `getServerSnapshot`: Return `false` (SSR)

## Edge Cases

- **SSR hydration**: All hooks return conservative defaults on server to prevent hydration mismatches
- **Cross-tab localStorage sync**: `useLocalStorage` listens for `storage` events from other tabs
- **Memory stability**: `useCallback` wraps subscribe functions to maintain stable references

## Testing Strategy

1. Run `npm run lint` to verify all errors are resolved
2. Run `npm run build` to verify no type errors
3. Manual verification in browser (dev server) to ensure functionality works

## Rollback Considerations

If issues arise, the original implementations are simple and can be restored. The main risk is hydration mismatches, which would manifest as React warnings in the console.

## Self-Verification Checklist

- [x] **Skills checked**: Listed all available skills (skill-generator, vercel-react-best-practices, web-animations, web-design-guidelines)
- [x] **Skills loaded**: Read vercel-react-best-practices SKILL.md; created new client-sync-external-store rule
- [x] **Knowledge gaps filled**: Web research confirmed useSyncExternalStore is React 19's recommended pattern
- [x] **Codebase explored**: Read all 3 affected files (Portal.tsx, useLocalStorage.ts, useMediaQuery.ts)
- [x] **Tests identified**: No unit tests for these hooks (lint + build verification)
- [x] **Patterns matched**: Following React 19 best practices and new skill rule
- [x] **Edge cases covered**: SSR hydration, cross-tab sync, stable references
- [x] **Dependencies ordered**: Files are independent, can be fixed in any order
- [x] **Conflicts resolved**: No conflicts
- [x] **Assumptions documented**: Assumes React 19 useSyncExternalStore API is available (verified in project)
