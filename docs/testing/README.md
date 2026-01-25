# Testing

Testing infrastructure for lolcooldown.

## Quick Reference

```bash
npm test              # Vitest watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run test:e2e      # Playwright E2E
```

## Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit | Vitest + Testing Library | Functions, hooks, components |
| E2E | Playwright | Full user flows, visual regression |
| Mocking | vitest-mock-extended | Prisma, external APIs |

## Test Locations

```
src/
├── lib/
│   ├── utils.test.ts              # cn() utility
│   ├── game/
│   │   ├── difficulty.test.ts     # Difficulty scaling
│   │   └── reducer.test.ts        # Game state machine
│   ├── hooks/
│   │   └── useLocalStorage.test.ts
│   └── data/
│       └── abilities.test.ts      # Round generation
tests/
└── visual.spec.ts                 # Playwright visual tests
```

Co-locate unit tests with source files (`*.test.ts` next to `*.ts`).

## Coverage Summary

| Module | Tests | Status |
|--------|-------|--------|
| `cn()` utility | 28 | Passing |
| Difficulty scaling | 18 | Passing |
| Game reducer | 30 | Passing |
| Round generation | 20 | Passing |
| useLocalStorage | 25 passing, 5 skipped | See [known-issues.md](./known-issues.md) |

## Writing Tests

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { getDifficulty } from './difficulty'

describe('getDifficulty', () => {
  it('returns beginner for score 0-4', () => {
    expect(getDifficulty(0)).toBe('beginner')
    expect(getDifficulty(4)).toBe('beginner')
  })
})
```

### Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

it('persists value to localStorage', () => {
  const { result } = renderHook(() => useLocalStorage('key', 'initial'))

  act(() => {
    result.current[1]('updated')
  })

  expect(localStorage.getItem('key')).toBe('"updated"')
})
```

### Mocking Framer Motion

Framer Motion is mocked globally in `vitest.setup.ts` to avoid animation complexity:

```typescript
vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button', span: 'span' },
  AnimatePresence: ({ children }) => children,
  useReducedMotion: () => false
}))
```

## E2E Tests

Use `data-testid` attributes for reliable selection:

```typescript
// Component
<div data-testid="game-container">...</div>

// Test
await page.locator('[data-testid="game-container"]').click()
```

### Async Server Components

Vitest doesn't fully support async Server Components. Use Playwright E2E for testing pages with `async` components.

## Future Work

See [strategy.md](./strategy.md) for planned expansions:
- Prisma mock setup for database tests
- CI/CD integration with GitHub Actions
- Accessibility tests with axe-core
- Claude Code hooks for automated validation
