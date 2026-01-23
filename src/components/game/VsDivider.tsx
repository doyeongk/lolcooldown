'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion'

export function VsDivider() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="flex items-center justify-center">
      <div
        className="
          relative w-16 h-16 md:w-20 md:h-20
          rounded-full bg-gold
          flex items-center justify-center
          border-4 border-dark-blue
        "
      >
        {/* Breathing glow animation */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={prefersReducedMotion ? {} : {
            boxShadow: [
              '0 0 20px rgba(var(--gold-rgb), 0.4)',
              '0 0 35px rgba(var(--gold-rgb), 0.6)',
              '0 0 20px rgba(var(--gold-rgb), 0.4)',
            ],
          }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            duration: 3,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
        {/* Inner ring for depth */}
        <div className="absolute inset-2 rounded-full border border-dark-blue/20" />
        <span className="relative text-dark-blue font-bold text-xl md:text-2xl">VS</span>
      </div>
    </div>
  )
}
