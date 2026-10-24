export type XpReason = 'checkin' | 'tutorial' | 'practice'

export type XpPayload = {
  amount: number
  reason?: XpReason
  customReason?: string
}

type Listener = (payload: XpPayload) => void

let _listener: Listener | null = null

export const xpEmitter = {
  subscribe: (fn: Listener) => { _listener = fn },
  unsubscribe: () => { _listener = null },
  emit: (payload: XpPayload) => { _listener?.(payload) },
}
