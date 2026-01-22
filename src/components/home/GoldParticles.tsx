"use client"

import { useMemo } from "react"
import { useReducedMotion } from "@/lib/motion"

const PARTICLE_COUNT = 18

interface Particle {
  id: number
  left: string
  size: number
  opacity: number
  duration: number
  delay: number
}

export function GoldParticles() {
  const reducedMotion = useReducedMotion()

  // Safe to use Math.random() here - component is dynamically imported with ssr: false
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 2, // 2-4px
        opacity: 0.1 + Math.random() * 0.1, // 10-20%
        duration: 30 + Math.random() * 20, // 30-50s
        delay: Math.random() * -30, // Stagger start times
      })),
    []
  )

  if (reducedMotion) {
    return null
  }

  return (
    <div
      className="fixed inset-0 -z-5 overflow-hidden pointer-events-none"
      role="presentation"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gold animate-particle-float"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
