"use client"

import Link from "next/link"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { HIGH_SCORE_KEY } from "@/lib/game/difficulty"

// One orchestrated entrance: wordmark, tagline, then the mode card
const enter = (delayMs: number, rise = 20) =>
  ({ animationDelay: `${delayMs}ms`, "--fade-y": `${rise}px` }) as React.CSSProperties

export function HomeScreen() {
  const [highScore] = useLocalStorage<number>(HIGH_SCORE_KEY, 0)

  return (
    <>
      <div
        className="relative flex flex-col items-center text-center pt-8"
        style={{ filter: "drop-shadow(0 4px 24px rgba(0, 0, 0, 0.4))" }}
      >
        <h1
          className="animate-fade-up text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tight"
          style={{
            ...enter(200),
            textShadow: "0 0 60px rgba(var(--gold-rgb), 0.4), 0 0 120px rgba(var(--gold-rgb), 0.2)",
          }}
        >
          <span className="text-gold">LOL</span>
          <span className="text-foreground">COOLDOWN</span>
        </h1>

        <p
          className="animate-fade-up mt-6 text-xs sm:text-sm tracking-[0.2em] uppercase text-foreground/50"
          style={enter(350)}
        >
          Which ability cools down faster?
        </p>

        <div className="animate-fade-up mt-16 w-full max-w-sm" style={{ ...enter(500, 15), animationDuration: "400ms" }}>
          <Link
            href="/play/random"
            className="group relative block px-6 py-5 bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm border border-gold/50 transition-[translate,scale,border-color,box-shadow] duration-300 ease-(--ease-out) hover:translate-x-1 hover:border-gold hover:shadow-[0_0_20px_rgba(227,207,116,0.2)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {/* Corner accents */}
            <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-gold transition-colors duration-300 group-hover:border-foreground" />
            <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-gold transition-colors duration-300 group-hover:border-foreground" />
            <h2 className="text-base font-semibold tracking-wide uppercase text-gold transition-colors duration-300 group-hover:text-foreground">
              Random Champions
            </h2>
            <p className="mt-0.5 text-sm text-foreground/40">Any champion, any ability</p>
            {/* Inner glow on hover */}
            <span
              className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100"
              style={{ boxShadow: "inset 0 0 24px rgba(var(--gold-rgb), 0.08)" }}
            />
          </Link>
        </div>

        {highScore > 0 && (
          <div className="animate-fade-up mt-10 text-center" style={enter(500)}>
            <p className="text-xs text-foreground/40 uppercase tracking-wider">Best Streak</p>
            <p className="text-2xl font-bold text-gold mt-1">{highScore}</p>
          </div>
        )}
      </div>

      <footer className="animate-fade-up absolute bottom-6 text-sm text-foreground/30" style={{ ...enter(1000, 0) }}>
        <Link
          href="https://github.com/doyeongk/lolcooldown"
          className="hover:text-foreground/50 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
      </footer>
    </>
  )
}
