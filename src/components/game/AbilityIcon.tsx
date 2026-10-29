'use client'

import { useState } from 'react'
import Image from 'next/image'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { sanitizeHtml } from '@/lib/utils/sanitizeHtml'

interface AbilityIconProps {
  icon: string | null
  name: string
  description: string | null
}

/** Ability icon; its description opens in a tooltip on desktop and a bottom sheet on mobile. */
export function AbilityIcon({ icon, name, description }: AbilityIconProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const html = description ? sanitizeHtml(description) : ''

  const iconButton = (
    <button
      type="button"
      onClick={() => isMobile && description && setSheetOpen(true)}
      className="relative w-14 h-14 md:w-24 md:h-24 rounded-lg border-[3px] border-gold bg-dark-blue/60 shadow-[0_0_16px_rgba(var(--gold-rgb),0.4),inset_0_0_0_1px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50"
      aria-label={`${name} ability info`}
    >
      <div className="absolute inset-[3px] rounded-[5px] border border-gold/20 pointer-events-none z-10" />
      {icon && <Image src={icon} alt={name} fill sizes="(max-width: 640px) 80px, 96px" className="object-cover" />}
    </button>
  )

  if (!description) return iconButton

  // Content is sanitised via sanitizeHtml before rendering
  const body = <div className="ability-description text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />

  if (isMobile) {
    return (
      <>
        {iconButton}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="max-h-[70vh]">
            <SheetTitle className="text-center text-lg font-semibold text-gold sm:text-left">{name}</SheetTitle>
            <VisuallyHidden>
              <SheetDescription>Ability description</SheetDescription>
            </VisuallyHidden>
            <div className="pt-2 overflow-y-auto text-foreground/90">{body}</div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{iconButton}</TooltipTrigger>
      <TooltipContent side="top" className="w-80 max-w-[calc(100vw-2rem)] p-4 text-foreground/80">
        <h3 className="font-bold text-gold uppercase tracking-wide mb-1">{name}</h3>
        {body}
      </TooltipContent>
    </Tooltip>
  )
}
