'use client'

import { useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const subscribe = () => () => {} // No-op: document.body doesn't change
const getSnapshot = () => true
const getServerSnapshot = () => false

export function Portal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!mounted) return null
  return createPortal(children, document.body)
}
