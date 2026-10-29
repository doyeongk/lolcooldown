import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GuessChoice } from '@/types/game'

interface GuessButtonsProps {
  onGuess: (choice: GuessChoice) => void
  /** Fade out and ignore input (while the answer is shown) */
  hidden: boolean
}

const base =
  'relative flex-1 flex items-center justify-center gap-[clamp(0.25rem,1vh,0.5rem)] px-[clamp(0.75rem,2vh,1rem)] py-[clamp(0.5rem,1.5vh,0.75rem)] rounded-lg font-bold text-[clamp(0.875rem,1.8vh,1rem)] uppercase tracking-wide touch-manipulation transition-[scale,border-color,box-shadow] duration-150 ease-(--ease-out) active:scale-[0.97] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue'
const icon = 'w-[clamp(1rem,2.5vh,1.25rem)] h-[clamp(1rem,2.5vh,1.25rem)]'

/** Mobile guess bar, fixed to the bottom (desktop guesses with the panel's click zones). */
export function GuessButtons({ onGuess, hidden }: GuessButtonsProps) {
  return (
    <div
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-40 px-[clamp(0.75rem,2vh,1rem)] pb-[calc(clamp(0.5rem,1.5vh,1rem)+env(safe-area-inset-bottom))] backdrop-blur-sm transition-opacity duration-200 ease-(--ease-out)',
        hidden && 'pointer-events-none opacity-0'
      )}
      aria-hidden={hidden}
    >
      <div className="flex gap-[clamp(0.5rem,1.5vh,0.75rem)] max-w-md mx-auto">
        <button
          type="button"
          onClick={() => onGuess('lower')}
          disabled={hidden}
          className={cn(base, 'bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm text-foreground border-2 border-gold/30 shadow-lg shadow-black/30 hover:border-gold/60 focus-visible:ring-foreground')}
          aria-label="Guess lower cooldown"
        >
          <ChevronDown className={icon} strokeWidth={3} aria-hidden="true" />
          Lower
        </button>
        <button
          type="button"
          onClick={() => onGuess('higher')}
          disabled={hidden}
          className={cn(base, 'bg-gold text-dark-blue shadow-[0_0_16px_rgba(227,207,116,0.3)] hover:shadow-[0_0_24px_rgba(227,207,116,0.5)] focus-visible:ring-gold')}
          aria-label="Guess higher cooldown"
        >
          <ChevronUp className={icon} strokeWidth={3} aria-hidden="true" />
          Higher
        </button>
      </div>
    </div>
  )
}
