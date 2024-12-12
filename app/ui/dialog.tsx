import React, { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#0a1118] rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ children }: { children: ReactNode }) {
  return <div className="p-4">{children}</div>
}

