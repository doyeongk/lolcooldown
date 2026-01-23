import type { Variants, Transition } from "framer-motion"

// Shared spring configuration
export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
}

export const smoothTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.3,
}

// Basic animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
}

export const numberPop: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
}

// Cooldown reveal animation
export const cooldownReveal: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: smoothTransition,
  },
}

// Feedback animations
export const correctPulse: Variants = {
  initial: { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0)" },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(34, 197, 94, 0.7)",
      "0 0 20px 10px rgba(34, 197, 94, 0.4)",
      "0 0 0 0 rgba(34, 197, 94, 0)",
    ],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
}

export const incorrectShake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-5, 5, -5, 5, -5, 5, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
}

// Slide animations
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: smoothTransition },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: smoothTransition },
}

// Desktop panel carousel variants
export const desktopPanelVariants: Variants = {
  // Initial state - entering from right
  enter: { x: "100%" },
  // Center position
  center: { x: 0 },
  // Exiting to left
  exitLeft: { x: "-100%" },
  // Shifting from right to center (for middle panel)
  shiftLeft: { x: 0 },
}

// Mobile panel variants (vertical slide)
export const mobilePanelVariants: Variants = {
  // Initial state - entering from bottom
  enter: { y: "100%" },
  // Center position
  center: { y: 0 },
  // Exiting to top
  exitUp: { y: "-100%" },
}

// Panel transition timing
export const panelTransition: Transition = {
  type: "tween",
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier approximating ease-out
  duration: 0.5,
}

// For AnimatePresence mode settings
export const presenceMode = "popLayout" as const

// Mobile panel transition (used in CooldownClash)
export const mobilePanelTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
}

// Game container staggered entrance
export const gameContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

// Gold glow pulse animation (2s loop)
export const goldGlowPulse: Variants = {
  initial: {
    textShadow: '0 0 10px rgba(var(--gold-rgb), 0.3)',
  },
  animate: {
    textShadow: [
      '0 0 10px rgba(var(--gold-rgb), 0.3)',
      '0 0 20px rgba(var(--gold-rgb), 0.6)',
      '0 0 10px rgba(var(--gold-rgb), 0.3)',
    ],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}
