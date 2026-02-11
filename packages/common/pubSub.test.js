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
})
