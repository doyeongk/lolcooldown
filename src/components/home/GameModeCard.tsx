"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GameModeCardProps {
  title: string
  description: string
  href: string
  variant: "primary" | "secondary"
  icon?: ReactNode
}

export function GameModeCard({
  title,
  description,
  href,
  variant,
  icon,
}: GameModeCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative p-6 rounded-xl border-2 cursor-pointer",
          "transition-colors duration-200",
          variant === "primary" &&
            "bg-gold/10 border-gold hover:bg-gold/20",
          variant === "secondary" &&
            "bg-dark-blue-hover/50 border-foreground/20 hover:border-gold/50"
        )}
      >
        {icon && <div className="mb-3 text-gold">{icon}</div>}
        <h2
          className={cn(
            "text-xl font-bold mb-1",
            variant === "primary" ? "text-gold" : "text-foreground"
          )}
        >
          {title}
        </h2>
        <p className="text-sm text-foreground/60">{description}</p>
      </motion.div>
    </Link>
  )
}
