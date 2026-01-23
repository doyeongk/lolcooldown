'use client'

import { motion } from 'framer-motion'

interface TransitionOverlayProps {
  prefersReducedMotion: boolean
}

export function TransitionOverlay({ prefersReducedMotion }: TransitionOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0d0a]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!prefersReducedMotion && (
        <motion.div
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,162,39,0.3) 0%, transparent 70%)',
          }}
          initial={{ scale: 1, opacity: 0.3 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          exit={{
            scale: 3,
            opacity: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
          }}
        />
      )}
    </motion.div>
  )
}
