/**
 * Centralized animation timing constants
 * All delays/durations in milliseconds unless noted
 */
export const TIMING = {
  /** Delay before transitioning after reveal */
  REVEAL_DELAY: 1200,
  /** Mobile carousel transition delay (300ms animation + 50ms buffer) */
  MOBILE_TRANSITION: 350,
  /** Desktop carousel transition delay (350ms animation + 50ms buffer) */
  DESKTOP_TRANSITION: 400,
  /** Panel slide duration in seconds (Framer Motion) */
  PANEL_DURATION: 0.28,
  /** Feedback animation duration in seconds */
  FEEDBACK_DURATION: 0.5,
} as const
