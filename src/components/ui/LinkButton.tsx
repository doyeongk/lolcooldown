import Link from "next/link"
import type { ComponentProps } from "react"

type LinkButtonVariant = "primary" | "secondary" | "gold" | "darkBlue"
type LinkButtonSize = "md" | "lg"

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: LinkButtonVariant
  size?: LinkButtonSize
}

const variantStyles: Record<LinkButtonVariant, string> = {
  primary: "bg-gold text-dark-blue hover:bg-gold-hover",
  secondary:
    "bg-dark-blue text-gold border border-gold hover:bg-dark-blue-hover",
  gold: "bg-gold text-dark-blue border-2 border-dark-blue hover:bg-gold-hover",
  darkBlue:
    "bg-dark-blue text-gold border-2 border-gold hover:bg-dark-blue-hover",
}

const sizeStyles: Record<LinkButtonSize, string> = {
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
}

function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-lg
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Link>
  )
}

export { LinkButton, type LinkButtonProps }
