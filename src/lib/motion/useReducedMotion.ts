import { useReducedMotion as useFramerReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"

/**
 * Returns empty variants when user prefers reduced motion
 * This effectively disables all Framer Motion animations
 */
export function useAccessibleVariants(variants: Variants): Variants {
  const prefersReducedMotion = useFramerReducedMotion()

  if (prefersReducedMotion) {
    // Return empty variants that just show the final state
    const emptyVariants: Variants = {}
    for (const key of Object.keys(variants)) {
      emptyVariants[key] = {}
    }
    return emptyVariants
  }

  return variants
}

export { useFramerReducedMotion as useReducedMotion }
