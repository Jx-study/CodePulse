import type { ToastItem } from './types'

type Listener = (toast: ToastItem) => void

let _listener: Listener | null = null

export const toastEmitter = {
  subscribe: (fn: Listener) => { _listener = fn },
  unsubscribe: () => { _listener = null },
  emit: (toast: ToastItem) => { _listener?.(toast) },
}
