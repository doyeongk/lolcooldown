# UI Components

## Component Library

This project uses [Shadcn/ui](https://ui.shadcn.com/) components built on Radix primitives. All components are in `src/components/ui/`.

## Button

Variant-driven button with multiple styles and sizes.

```tsx
import { Button } from '@/components/ui/button'

<Button variant="gold" size="lg">Play Now</Button>
<Button variant="outline" size="sm">Settings</Button>
```

### Variants

| Variant | Description |
|---------|-------------|
| `default` | Neutral background |
| `primary` | Blue accent |
| `gold` | Gold gradient, primary CTA |
| `outline` | Border only |
| `ghost` | Transparent, hover reveals |
| `destructive` | Red for dangerous actions |

### Sizes

| Size | Padding |
|------|---------|
| `sm` | Compact |
| `default` | Standard |
| `lg` | Large touch target |
| `icon` | Square for icons only |

### Slot Composition

Use `asChild` to render as a different element:

```tsx
<Button asChild variant="gold">
  <Link href="/play">Start Game</Link>
</Button>
```

## Dialog

Modal overlay with backdrop blur and gold border.

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Game Over</DialogTitle>
      <DialogDescription>Your score: 42</DialogDescription>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

### Features

- Backdrop blur effect
- Gold border accent
- Dark blue background
- Focus trap and aria attributes
- Escape to close

## Tooltip

Hover hints with directional animations.

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent side="top">
      Helpful information
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Props

| Prop | Values |
|------|--------|
| `side` | `top`, `bottom`, `left`, `right` |
| `align` | `start`, `center`, `end` |

## Sheet

Slide-out panel for mobile navigation.

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger>Open Menu</SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Menu</SheetTitle>
    </SheetHeader>
    {/* navigation */}
  </SheetContent>
</Sheet>
```

## Creating Variants with CVA

Use `class-variance-authority` for variant-driven styling:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-lg border bg-card', // base styles
  {
    variants: {
      size: {
        sm: 'p-4',
        lg: 'p-8',
      },
      highlighted: {
        true: 'border-gold',
        false: 'border-border',
      },
    },
    defaultVariants: {
      size: 'sm',
      highlighted: false,
    },
  }
)

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode
}

function Card({ size, highlighted, children }: CardProps) {
  return (
    <div className={cardVariants({ size, highlighted })}>
      {children}
    </div>
  )
}
```

## Color Palette

CSS variables defined in `src/app/globals.css`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--gold` | `#c9a227` | Primary accent |
| `--gold-hover` | `#b8931f` | Hover state |
| `--gold-rgb` | `201, 162, 39` | For rgba() |
| `--dark-blue` | `#172b3b` | Background |
| `--dark-blue-hover` | `#1e3a4a` | Hover state |
| `--foreground` | `#e7e9ea` | Text |
| `--background` | `#0a1419` | Page background |

### Using Colors

```css
/* Direct variable */
color: var(--gold);

/* With opacity via RGB */
background: rgba(var(--gold-rgb), 0.5);
```

## Utility Function

Use `cn()` from `src/lib/utils.ts` for conditional classnames:

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  variant === 'gold' && 'gold-styles'
)} />
```

## Adding New Shadcn Components

```bash
npx shadcn@latest add <component-name>
```

Components are copied to `src/components/ui/` for full customization.
