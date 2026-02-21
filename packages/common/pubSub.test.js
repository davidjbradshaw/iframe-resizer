import pubSub from './pubSub'

describe('common/pubSub', () => {
  beforeEach(() => {
    // Reset internal event registry
    pubSub.events = {}
  })

  test('add/remove listener and has()', () => {
    const evt = 'ready'
    const fn = () => {}

    expect(pubSub.has(evt)).toBe(false)
    const remove = pubSub.addListener(evt, fn)

    expect(pubSub.has(evt)).toBe(true)

    // Remove should detach the exact listener
    remove()

    expect(pubSub.has(evt)).toBe(true) // array still exists
    expect(pubSub.events[evt]).toHaveLength(0)
  })

  test('emit invokes listeners with arguments', () => {
    const evt = 'message'
    const calls = []
    const fn = (...args) => calls.push(args)

    pubSub.addListener(evt, fn)
    pubSub.emit(evt, 'a', 'b')

    expect(calls).toEqual([['a', 'b']])
  })

  test('once invokes the listener only once', () => {
    const evt = 'init'
    let count = 0
    const fn = () => {
      count += 1
    }

    pubSub.once(evt, fn)
    pubSub.emit(evt)
    pubSub.emit(evt)

    expect(count).toBe(1)
  })

  test('removeListener handles non-existent event', () => {
    expect(() => pubSub.removeListener('nonexistent', () => {})).not.toThrow()
  })

  test('removeListener handles non-existent listener', () => {
    const evt = 'test'
    const fn1 = () => {}
    const fn2 = () => {}

    pubSub.addListener(evt, fn1)

    // Try to remove a listener that was never added
    expect(() => pubSub.removeListener(evt, fn2)).not.toThrow()

    // Verify fn1 is still there
    expect(pubSub.events[evt]).toHaveLength(1)
  })
})
