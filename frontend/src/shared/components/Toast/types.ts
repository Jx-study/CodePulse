export type ToastVariant = 'warning' | 'error' | 'success' | 'info'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}
