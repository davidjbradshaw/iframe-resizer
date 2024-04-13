export default {
  events: {},

  has(event) {
    return typeof this.events[event] === 'object'
  },

  addListener(event, listener) {
    if (!this.has(event)) this.events[event] = []
    this.events[event].push(listener)
    return () => this.removeListener(event, listener)
  },

  removeListener(event, listener) {
    if (!this.has(event)) return
    const idx = this.events[event].indexOf(listener)
    if (idx === -1) return
    this.events[event].splice(idx, 1)
  },

  emit(event, ...args) {
    this.events[event]?.forEach((listener) => listener(...args))
  },

  once(event, listener) {
    const remove = this.addListener(event, (...args) => {
      remove()
      listener(...args)
    })
  },
}
