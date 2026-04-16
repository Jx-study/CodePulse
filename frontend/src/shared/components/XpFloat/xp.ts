import { xpEmitter } from './xpEmitter'

export const xp = {
  show: (amount: number) => xpEmitter.emit(amount),
}
