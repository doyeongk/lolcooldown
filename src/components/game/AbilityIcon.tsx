'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import { sanitizeHtml } from '@/lib/utils/sanitizeHtml'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface AbilityIconProps {
  icon: string | null
  name: string
  description: string | null
}

export function AbilityIcon({ icon, name, description }: AbilityIconProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const isMobile = useIsMobile()

  // NOTE: sanitizeHtml already sanitizes content before rendering
  const sanitisedDescription = description ? sanitizeHtml(description) : ''

  const iconButton = (
    <button
      type="button"
      onClick={() => isMobile && description && setSheetOpen(true)}
      className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-lg border-[3px] border-gold bg-dark-blue/60 shadow-[0_0_12px_rgba(227,207,116,0.3)] overflow-hidden flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50"
      aria-label={`${name} ability info`}
    >
      {icon ? (
        <Image
          src={icon}
          alt={name}
          fill
          sizes="(max-width: 640px) 48px, 64px"
          className="object-cover"
        />
      ) : null}
    </button>
  )

  // Mobile: use Sheet
  if (isMobile) {
    return (
      <div className="relative">
        {iconButton}
        {description && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="bottom" className="max-h-[70vh]">
              <SheetHeader>
                <SheetTitle className="text-gold">{name}</SheetTitle>
                <VisuallyHidden>
                  <SheetDescription>Ability description</SheetDescription>
                </VisuallyHidden>
              </SheetHeader>
              <div className="p-4 pt-2 overflow-y-auto">
                {/* Content is sanitized via sanitizeHtml before rendering */}
                <div
                  className="ability-description text-base leading-relaxed text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: sanitisedDescription }}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    )
  }

  // Desktop: use Tooltip
  if (!description) {
    return <div className="relative">{iconButton}</div>
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {iconButton}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="w-80 max-w-[calc(100vw-2rem)] p-4 bg-dark-blue/95 backdrop-blur-sm border border-gold/30"
        >
          {/* Content is sanitized via sanitizeHtml before rendering */}
          <div
            className="ability-description text-base leading-relaxed text-foreground/90"
            dangerouslySetInnerHTML={{ __html: sanitisedDescription }}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
