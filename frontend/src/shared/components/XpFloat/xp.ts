import { xpEmitter, XpReason } from './xpEmitter'

export const xp = {
  show: (amount: number, options?: { reason?: XpReason; customReason?: string }) =>
    xpEmitter.emit({ amount, ...options }),
}
