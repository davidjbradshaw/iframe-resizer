import { OBJECT } from './consts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (...args: any[]) => void

interface PubSub {
  events: Record<string, Listener[]>
  has(event: string): boolean
  addListener(event: string, listener: Listener): () => void
  removeListener(event: string, listener: Listener): void
  emit(event: string, ...args: unknown[]): void
  once(event: string, listener: Listener): void
}

const pubSub: PubSub = {
  events: {},

  has(event: string): boolean {
    return typeof this.events[event] === OBJECT
  },

  addListener(event: string, listener: Listener): () => void {
    if (!this.has(event)) this.events[event] = []
    this.events[event].push(listener)
    return () => this.removeListener(event, listener)
  },

  removeListener(event: string, listener: Listener): void {
    if (!this.has(event)) return
    const idx = this.events[event].indexOf(listener)
    if (idx === -1) return
    this.events[event].splice(idx, 1)
  },

  emit(event: string, ...args: unknown[]): void {
    this.events[event]?.forEach((listener) => listener(...args))
  },

  once(event: string, listener: Listener): void {
    const remove = this.addListener(event, (...args: unknown[]) => {
      remove()
      listener(...args)
    })
  },
}

export default pubSub
