import '@testing-library/jest-dom'
import { vi } from 'vitest'
import type { ReactNode } from 'react'

// Mock framer-motion to avoid animation complexity in unit tests
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
    img: 'img',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    section: 'section',
    article: 'article',
    nav: 'nav',
    header: 'header',
    footer: 'footer',
    main: 'main',
    aside: 'aside',
    ul: 'ul',
    li: 'li',
    a: 'a',
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  useReducedMotion: () => false,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
  useTransform: () => ({ get: () => 0 }),
  useSpring: () => ({ get: () => 0 }),
}))
