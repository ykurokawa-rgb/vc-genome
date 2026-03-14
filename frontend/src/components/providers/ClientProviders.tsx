'use client'

import { type ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { CommandPalette } from '@/components/ui/CommandPalette'

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <CommandPalette />
    </ToastProvider>
  )
}
