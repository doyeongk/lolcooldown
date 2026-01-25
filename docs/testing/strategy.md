# Testing Strategy

Long-term testing roadmap for lolcooldown.

## Current State

### Implemented

- **Vitest**: Configured with jsdom, React Testing Library, path aliases
- **Playwright**: Chromium + iPhone 14 projects, visual regression
- **Unit tests**: Core game logic, utilities, hooks

### Test Coverage

| Category | Status |
|----------|--------|
| Game reducer (state machine) | Complete |
| Difficulty scaling | Complete |
| Round generation | Complete |
| Utility functions | Complete |
| useLocalStorage hook | Partial (object tests skipped) |
| Component tests | Not started |
| API route tests | Not started |
| Database tests | Not started |

## Planned Phases

### Phase 1: Foundation (Complete)

- [x] Install Vitest and dependencies
- [x] Create `vitest.config.ts` and `vitest.setup.ts`
- [x] Add test scripts to `package.json`
- [x] Unit tests for core modules

### Phase 2: Component & API Tests

- [ ] Add `data-testid` attributes to key components
- [ ] Component tests for `ScoreDisplay`, `LivesDisplay`
- [ ] API route tests for `/api/game/random`
- [ ] Prisma mock setup (`src/lib/__mocks__/db.ts`)

### Phase 3: E2E Expansion

- [ ] Game flow E2E tests (`tests/e2e/game-flow.spec.ts`)
- [ ] Mobile interaction tests
- [ ] Accessibility tests with `@axe-core/playwright`
- [ ] Reduced motion preference tests

### Phase 4: CI/CD Integration

- [ ] GitHub Actions workflow (`.github/workflows/test.yml`)
- [ ] Test database in CI with PostgreSQL service
- [ ] Playwright report artifacts on failure
- [ ] Coverage badge in README

### Phase 5: Claude Code Hooks

- [ ] Post-edit type checking
- [ ] Auto-run related tests on file change
- [ ] Pre-commit validation

## Configuration Files

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '*.config.*']
    }
  }
})
```

### vitest.setup.ts

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button', span: 'span' },
  AnimatePresence: ({ children }) => children,
  useReducedMotion: () => false
}))
```

## Prisma Mocking (Future)

```typescript
// src/lib/__mocks__/db.ts
import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import prisma from '../db'

vi.mock('../db', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}))

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
```

## GitHub Actions (Future)

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - run: npm run test:run
```

## Test Selectors

Add `data-testid` to key components:

| Component | Attribute |
|-----------|-----------|
| CooldownClash container | `data-testid="game-container"` |
| Left panel | `data-testid="left-panel"` |
| Right panel | `data-testid="right-panel"` |
| Score display | `data-testid="score"` |
| Lives display | `data-testid="lives"` |
| Game over modal | `data-testid="game-over"` |
| Restart button | `data-testid="restart-button"` |
