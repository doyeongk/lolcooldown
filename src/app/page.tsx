"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Crown, Shuffle } from "lucide-react"
import { GameModeCard } from "@/components/home/GameModeCard"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

export default function Home() {
  const [highScore] = useLocalStorage<number>("lolcooldown-highscore", 0)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Hero Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-6xl sm:text-7xl md:text-8xl font-black italic tracking-tighter text-center"
      >
        <span className="text-gold">LOL</span>
        <span className="text-foreground">COOLDOWN</span>
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 text-lg sm:text-xl text-foreground/80 text-center max-w-md"
      >
        Test your League knowledge. Which ability cools down faster?
      </motion.p>

      {/* Game Mode Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-12 w-full max-w-sm space-y-4"
      >
        <GameModeCard
          title="Choose Your Champion"
          description="Test your main's abilities"
          href="/play/main"
          variant="primary"
          icon={<Crown className="w-6 h-6" />}
        />
        <GameModeCard
          title="Random Champions"
          description="Random abilities, higher stakes"
          href="/play/random"
          variant="secondary"
          icon={<Shuffle className="w-6 h-6" />}
        />
      </motion.div>

      {/* High Score Teaser */}
      {highScore > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-foreground/50">Your best streak</p>
          <p className="text-3xl font-bold text-gold">{highScore}</p>
        </motion.div>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-sm text-foreground/40"
      >
        <Link
          href="https://github.com/doyeongk/lolcooldown"
          className="hover:text-gold transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
      </motion.footer>
    </main>
  )
}
