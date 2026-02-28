import { toastEmitter } from './toastEmitter'
import type { ToastVariant } from './types'

let _idCounter = 0

function show(message: string, variant: ToastVariant, duration = 3000) {
  toastEmitter.emit({
    id: String(++_idCounter),
    message,
    variant,
    duration,
  })
}

export const toast = {
  warning: (message: string, duration?: number) => show(message, 'warning', duration),
  error:   (message: string, duration?: number) => show(message, 'error',   duration),
  success: (message: string, duration?: number) => show(message, 'success', duration),
  info:    (message: string, duration?: number) => show(message, 'info',    duration),
}
