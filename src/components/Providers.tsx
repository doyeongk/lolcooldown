'use client'

import { TooltipProvider } from '@/components/ui/tooltip'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps): React.ReactNode {
  return <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
}
