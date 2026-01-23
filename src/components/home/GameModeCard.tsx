"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GameModeCardProps {
  title: string
  description: string
  href: string
  variant: "primary" | "secondary"
}

export function GameModeCard({
  title,
  description,
  href,
  variant,
}: GameModeCardProps) {
  const isPrimary = variant === "primary"

  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          // Base structure
          "relative px-6 py-5 cursor-pointer",
          "transition-all duration-300",
          // Warm dark background matching site palette
          "bg-gradient-to-b from-black/50 to-black/60",
          "backdrop-blur-sm",
          // Border with gold accent
          "border",
          isPrimary ? [
            "border-gold/50",
            "hover:border-gold",
            "hover:shadow-[0_0_20px_rgba(227,207,116,0.2)]",
          ] : [
            "border-gold/20",
            "hover:border-gold/40",
            "hover:shadow-[0_0_16px_rgba(227,207,116,0.1)]",
          ]
        )}
      >
        {/* Corner accents - top left */}
        <div
          className={cn(
            "absolute -top-px -left-px w-3 h-3 border-t border-l transition-colors duration-300",
            isPrimary
              ? "border-gold group-hover:border-foreground"
              : "border-gold/30 group-hover:border-gold/60"
          )}
        />
        {/* Corner accents - bottom right */}
        <div
          className={cn(
            "absolute -bottom-px -right-px w-3 h-3 border-b border-r transition-colors duration-300",
            isPrimary
              ? "border-gold group-hover:border-foreground"
              : "border-gold/30 group-hover:border-gold/60"
          )}
        />

        {/* Content */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col gap-0.5 text-center w-full">
            <h2
              className={cn(
                "text-base font-semibold tracking-wide uppercase",
                isPrimary ? "text-gold" : "text-foreground/80",
                "group-hover:text-foreground transition-colors duration-300"
              )}
            >
              {title}
            </h2>
            <p className="text-sm text-foreground/40">{description}</p>
          </div>
        </div>

        {/* Subtle inner glow for primary on hover */}
        {isPrimary && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: "inset 0 0 24px rgba(var(--gold-rgb), 0.08)",
            }}
          />
        )}
      </motion.div>
    </Link>
  )
}
