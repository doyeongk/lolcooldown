"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { GameModeCard } from "@/components/home/GameModeCard"
import { IconWall } from "@/components/home/IconWall"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

// Client-only: uses Math.random() for particle positions
const GoldParticles = dynamic(
  () => import("@/components/home/GoldParticles").then((mod) => mod.GoldParticles),
  { ssr: false }
)

// Easing curve for smooth animations
const easeOut = [0.22, 1, 0.36, 1] as const

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
}

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
}

export default function Home() {
  const [highScore] = useLocalStorage<number>("lolcooldown-highscore", 0)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Background layers */}
      <IconWall />
      <GoldParticles />

      {/* Content container - centered with subtle elevation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center text-center pt-8"
        style={{
          // Subtle drop shadow creates "floating" effect
          filter: "drop-shadow(0 4px 24px rgba(0, 0, 0, 0.4))",
        }}
      >
        {/* Logo with enhanced gold glow for depth */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tight"
          style={{
            textShadow: "0 0 60px rgba(227, 207, 116, 0.4), 0 0 120px rgba(227, 207, 116, 0.2)",
          }}
        >
          <span className="text-gold">LOL</span>
          <span className="text-foreground">COOLDOWN</span>
        </motion.h1>

        {/* Tagline - editorial, not generic */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-xs sm:text-sm tracking-[0.2em] uppercase text-foreground/50"
        >
          Which ability cools down faster?
        </motion.p>

        {/* Game Mode Cards */}
        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          animate="visible"
          className="mt-16 w-full max-w-sm space-y-3"
        >
{/* TODO: Re-enable when "Main Champions" gamemode is implemented
          <motion.div variants={cardVariants}>
            <GameModeCard
              title="Choose Your Champion"
              description="Test your main's abilities"
              href="/play/main"
              variant="primary"
            />
          </motion.div>
*/}
          <motion.div variants={cardVariants}>
            <GameModeCard
              title="Random Champions"
              description="Any champion, any ability"
              href="/play/random"
              variant="primary"
            />
          </motion.div>
        </motion.div>

        {/* High Score */}
        {highScore > 0 && (
          <motion.div
            variants={itemVariants}
            className="mt-10 text-center"
          >
            <p className="text-xs text-foreground/40 uppercase tracking-wider">Best Streak</p>
            <p className="text-2xl font-bold text-gold mt-1">{highScore}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-6 text-sm text-foreground/30"
      >
        <Link
          href="https://github.com/doyeongk/lolcooldown"
          className="hover:text-foreground/50 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
      </motion.footer>
    </main>
  )
}
