type Listener = (amount: number) => void

let _listener: Listener | null = null

export const xpEmitter = {
  subscribe: (fn: Listener) => { _listener = fn },
  unsubscribe: () => { _listener = null },
  emit: (amount: number) => { _listener?.(amount) },
}
