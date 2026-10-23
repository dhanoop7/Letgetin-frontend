export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}
