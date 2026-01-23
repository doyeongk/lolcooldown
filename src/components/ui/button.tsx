"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gold text-dark-blue hover:bg-gold-hover",
        primary: "bg-gold text-dark-blue hover:bg-gold-hover",
        secondary: "bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm text-foreground border border-gold/30 hover:from-black/60 hover:to-black/70 hover:shadow-[0_0_12px_rgba(var(--gold-rgb),0.2)]",
        outline: "border border-gold text-gold hover:bg-gold hover:text-dark-blue",
        gold: "bg-gold text-dark-blue border-2 border-dark-blue hover:bg-gold-hover",
        darkBlue: "bg-dark-blue text-gold border-2 border-gold hover:bg-dark-blue-hover",
        ghost: "hover:bg-dark-blue-hover text-foreground",
        link: "text-gold underline-offset-4 hover:underline",
        destructive: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
        xl: "h-14 rounded-lg px-10 text-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
