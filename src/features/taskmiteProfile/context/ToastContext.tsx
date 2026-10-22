'use client'

import React, { createContext, useState, useCallback, ReactNode, useContext } from 'react'
import type { ToastMessage, ToastType } from '../types/common.types'

export interface ToastContextType {
  toasts: ToastMessage[]
  showToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const newToast: ToastMessage = { id, message, type, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      toasts: [],
      showToast: (msg: string) => {
        console.log('[Toast fallback]:', msg)
      },
      removeToast: () => {},
    }
  }
  return context
}
