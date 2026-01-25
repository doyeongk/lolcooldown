# Testing Strategy TODO

Comprehensive testing setup for lolcooldown (Next.js 16 + React 19 + Prisma 7).

## Current State

- **Vitest**: Configured with jsdom, React Testing Library, framer-motion mock
- **Unit tests**: 121 passing, 5 skipped (126 total)
- **Playwright**: Configured with Chromium + iPhone 14 projects
- **Visual tests**: Basic setup in `tests/visual.spec.ts`
- **Documentation**: See `docs/testing/` for detailed docs

### Test Coverage

| Module | Tests | Status |
|--------|-------|--------|
| `cn()` utility | 28 | Passing |
| Difficulty scaling | 18 | Passing |
| Game reducer | 30 | Passing |
| Round generation | 20 | Passing |
| useLocalStorage | 25 passing, 5 skipped | Partial (see `docs/testing/known-issues.md`) |

---

## 1. Unit & Component Testing (Vitest)

### 1.1 Install Vitest Stack

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event vite-tsconfig-paths vitest-mock-extended
```

### 1.2 Configure Vitest

Create `vitest.config.ts`:

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

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock framer-motion to avoid animation complexity in unit tests
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useReducedMotion: () => false
}))
```

### 1.3 Add Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 1.4 Priority Test Files

| Component | File | What to Test |
|-----------|------|--------------|
| Game reducer | `src/lib/game/reducer.test.ts` | State transitions, phase machine |
| Difficulty scaling | `src/lib/game/difficulty.test.ts` | Score → difficulty mapping |
| useLocalStorage | `src/lib/hooks/useLocalStorage.test.ts` | Cross-tab sync, SSR safety |
| Round generation | `src/lib/data/abilities.test.ts` | Filtering, carousel logic |
| cn utility | `src/lib/utils/utils.test.ts` | Class merging |

### 1.5 React 19 / Async Server Components

> **Note**: Vitest doesn't fully support async Server Components yet. Use Playwright E2E for testing pages with `async` components.

For synchronous client components, standard React Testing Library patterns work:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScoreDisplay } from '@/components/game/ScoreDisplay'

describe('ScoreDisplay', () => {
  it('renders score and lives', () => {
    render(<ScoreDisplay score={5} lives={2} highScore={10} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
```

---

## 2. E2E Testing (Playwright)

### 2.1 Current Setup

Already configured with:
- Chromium + iPhone 14 (mobile) projects
- HTML reporter
- Dev server auto-start
- Visual regression in `tests/visual.spec.ts`

### 2.2 Expand Test Coverage

Create `tests/game-flow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Cooldown Clash', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/play/random')
    await page.waitForSelector('[data-testid="game-container"]')
  })

  test('displays two abilities', async ({ page }) => {
    await expect(page.locator('[data-testid="left-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="right-panel"]')).toBeVisible()
  })

  test('clicking correct answer increases score', async ({ page }) => {
    // Get initial score
    const initialScore = await page.locator('[data-testid="score"]').textContent()

    // Make a guess (we'll need to determine correct answer from DOM)
    await page.click('[data-testid="left-panel"]')

    // Wait for reveal phase
    await page.waitForTimeout(1500) // TIMING.REVEAL_DELAY + buffer

    // Score should change (either up or down)
    // Actual assertion depends on whether guess was correct
  })

  test('game over after 3 wrong answers', async ({ page }) => {
    // This needs strategic wrong guesses
    // Implementation depends on exposed cooldown data
  })
})
```

### 2.3 Add data-testid Attributes

Add to key components for reliable selection:

| Component | Attribute |
|-----------|-----------|
| CooldownClash container | `data-testid="game-container"` |
| Left panel | `data-testid="left-panel"` |
| Right panel | `data-testid="right-panel"` |
| Score display | `data-testid="score"` |
| Lives display | `data-testid="lives"` |
| Game over modal | `data-testid="game-over"` |
| Restart button | `data-testid="restart-button"` |

### 2.4 Mobile-Specific Tests

```typescript
test.describe('Mobile interactions', () => {
  test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14

  test('higher/lower buttons work', async ({ page }) => {
    await page.goto('/play/random')
    await page.waitForSelector('[data-testid="game-container"]')

    await expect(page.locator('[data-testid="higher-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="lower-button"]')).toBeVisible()
  })
})
```

### 2.5 Accessibility Tests

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('home page has no accessibility violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

Install: `npm install -D @axe-core/playwright`

### 2.6 Reduced Motion Tests

```typescript
test('respects prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/play/random')

  // Verify animations are disabled
  // Check CSS custom properties or computed styles
})
```

---

## 3. Database Testing (Prisma)

### 3.1 Unit Tests with Mocking

Create `src/lib/__mocks__/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { beforeEach } from 'vitest'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

import prisma from '../db'

vi.mock('../db', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
```

Use in tests:

```typescript
import { prismaMock } from '@/lib/__mocks__/db'
import { getAbilitiesForRound } from '@/lib/data/abilities'

describe('getAbilitiesForRound', () => {
  it('filters by difficulty', async () => {
    prismaMock.ability.findMany.mockResolvedValue([
      { id: 1, name: 'Test', slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }
    ])

    const result = await getAbilitiesForRound('beginner')
    expect(result).toHaveLength(1)
  })
})
```

### 3.2 Integration Tests with Real Database

Create `tests/integration/setup.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

export async function setupTestDatabase() {
  // Use a test database URL
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL

  // Push schema
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' })
}

export async function teardownTestDatabase() {
  await prisma.ability.deleteMany()
  await prisma.skin.deleteMany()
  await prisma.champion.deleteMany()
  await prisma.$disconnect()
}

export { prisma }
```

Add to `.env.test`:

```
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/lolcooldown_test
```

### 3.3 Docker Compose for Test DB

Create `docker-compose.test.yml`:

```yaml
version: '3.8'
services:
  postgres-test:
    image: postgres:16
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: lolcooldown_test
    ports:
      - "5433:5432"
```

---

## 4. Claude Code Hooks for Automated Validation

### 4.1 Post-Edit Type Checking

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit:*.ts|Edit:*.tsx",
        "command": "npx tsc --noEmit",
        "description": "Type-check after TypeScript edits"
      }
    ]
  }
}
```

### 4.2 Auto-Run Related Tests

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit:src/**/*.{ts,tsx}",
        "command": "npx vitest related --run ${file}",
        "description": "Run tests related to edited file"
      }
    ]
  }
}
```

### 4.3 Lint on Edit

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit:*.{ts,tsx,js,jsx}",
        "command": "npx eslint --fix ${file}",
        "description": "Auto-fix lint issues"
      }
    ]
  }
}
```

### 4.4 Pre-Commit Validation (Workaround)

Since Claude Code doesn't have native PreCommit hooks, use PostToolUse with Bash matcher:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash(git commit:*)",
        "command": "npm run test:run && npm run lint",
        "description": "Run tests before commit completes"
      }
    ]
  }
}
```

### 4.5 Full Hooks Configuration

`.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit:*.ts|Edit:*.tsx",
        "command": "npx tsc --noEmit 2>&1 | head -20",
        "timeout": 30000,
        "description": "Type-check TypeScript"
      },
      {
        "matcher": "Edit:src/**/*.test.{ts,tsx}",
        "command": "npx vitest run ${file}",
        "timeout": 60000,
        "description": "Run edited test file"
      },
      {
        "matcher": "Write:src/**/*.{ts,tsx}",
        "command": "npx eslint ${file} --fix",
        "timeout": 10000,
        "description": "Lint new files"
      }
    ]
  }
}
```

---

## 5. CI/CD Integration

### 5.1 GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [main, testing]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
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

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: lolcooldown_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx prisma generate
      - run: npx prisma db push
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/lolcooldown_test
      - run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/lolcooldown_test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
```

---

## 6. Test Organisation

### 6.1 Folder Structure

```
lolcooldown/
├── src/
│   ├── components/
│   │   └── game/
│   │       ├── CooldownClash.tsx
│   │       └── CooldownClash.test.tsx  # Co-located unit tests
│   ├── lib/
│   │   ├── game/
│   │   │   ├── difficulty.ts
│   │   │   └── difficulty.test.ts
│   │   ├── hooks/
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useLocalStorage.test.ts
│   │   └── __mocks__/
│   │       └── db.ts                   # Prisma mock
│   └── ...
├── tests/
│   ├── e2e/
│   │   ├── game-flow.spec.ts
│   │   └── home.spec.ts
│   ├── integration/
│   │   ├── setup.ts
│   │   └── api.spec.ts
│   └── visual.spec.ts                  # Existing
├── vitest.config.ts
├── vitest.setup.ts
└── playwright.config.ts                # Existing
```

### 6.2 Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Unit test | `*.test.ts(x)` | `difficulty.test.ts` |
| E2E test | `*.spec.ts` | `game-flow.spec.ts` |
| Integration | `*.spec.ts` in `tests/integration/` | `api.spec.ts` |

---

## 7. Implementation Order

### Phase 1: Foundation ✓

- [x] Install Vitest and dependencies
- [x] Create `vitest.config.ts` and `vitest.setup.ts`
- [x] Add test scripts to `package.json`
- [x] Write first unit test for `difficulty.ts` (simple, no mocking)
- [x] Add `data-testid` attributes to key components

### Phase 2: Core Coverage (Partial)

- [x] Unit tests for game reducer (state machine)
- [x] Unit tests for `useLocalStorage` hook (5 tests skipped due to useSyncExternalStore limitations)
- [x] Unit tests for round generation logic
- [x] Unit tests for `cn()` utility
- [ ] Prisma mock setup
- [ ] API route tests with mocked database

### Phase 3: E2E Expansion

- [ ] Game flow E2E tests
- [ ] Mobile interaction tests
- [ ] Accessibility tests with axe-core
- [ ] Reduced motion tests

### Phase 4: Claude Code Integration

- [ ] Set up Claude Code hooks in `.claude/settings.json`
- [ ] Test hook configurations
- [ ] Document hook usage in CLAUDE.md

### Phase 5: CI/CD

- [ ] Create GitHub Actions workflow
- [ ] Set up test database in CI
- [ ] Add Playwright report artifacts
- [ ] Badge in README

---

## 8. Testing Guidelines for CLAUDE.md

Added to `CLAUDE.md`:

```markdown
## Testing

### Run Tests

\`\`\`bash
npm test              # Vitest watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run test:e2e      # Playwright E2E
\`\`\`

### Writing Tests

- Co-locate unit tests with source: `Component.test.tsx` next to `Component.tsx`
- Use `data-testid` for E2E selectors, not CSS classes
- Mock Framer Motion in unit tests (see `vitest.setup.ts`)
- For async Server Components, use Playwright E2E instead of unit tests

### Before Committing

1. Run `npm run test:run` for unit tests
2. Run `npm run lint` for linting
3. For UI changes, run `npm run test:e2e`
```

---

## References

### Testing Best Practices
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
- [Vitest with Next.js](https://nextjs.org/docs/app/guides/testing/vitest)
- [Setting up Vitest for Next.js 15](https://www.wisp.blog/blog/setting-up-vitest-for-nextjs-15)
- [Strapi: Unit and E2E Tests with Vitest & Playwright](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright)

### Prisma Testing
- [Prisma: Unit Testing](https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing)
- [Prisma: Integration Testing](https://www.prisma.io/docs/orm/prisma-client/testing/integration-testing)
- [Prisma Testing Series](https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o)

### Claude Code Automation
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Playwright MCP with Claude Code](https://testomat.io/blog/playwright-mcp-claude-code/)
- [Playwright Agents with Claude Code](https://shipyard.build/blog/playwright-agents-claude-code/)
- [Claude Code Hooks for Automated Quality](https://www.letanure.dev/blog/2025-08-06--claude-code-part-8-hooks-automated-quality-checks)
