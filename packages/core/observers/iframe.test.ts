import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ advise: vi.fn(), event: vi.fn() }))
vi.mock('../methods/disconnect', () => ({ default: vi.fn() }))

const { advise } = await import('../console')
const disconnect = (await import('../methods/disconnect')).default
const settings = (await import('../values/settings')).default
const createIframeObserver = (await import('./iframe')).default

// The observer's callback runs in a microtask after the change
const afterMutations = () =>
  new Promise((resolve) => {
    setTimeout(resolve)
  })

function bind(id, { disconnectOnRemove = true, parent = document.body } = {}) {
  const iframe = document.createElement('iframe')
  iframe.id = id
  parent?.append(iframe)
  settings[id] = { iframe, disconnectOnRemove }
  return iframe
}

describe('core/observers/iframe', () => {
  beforeAll(() => {
    createIframeObserver()
  })

  afterEach(() => {
    vi.clearAllMocks()
    document.body.replaceChildren()
    for (const key of Object.keys(settings)) delete settings[key]
  })

  test('warns and disconnects a bound iframe removed from the page', async () => {
    const iframe = bind('removed')
    iframe.remove()
    await afterMutations()

    expect(advise).toHaveBeenCalledWith(
      'removed',
      expect.stringContaining('disconnect()'),
    )
    expect(disconnect).toHaveBeenCalledWith(iframe)
  })

  test('keeps the methods on the iframe, for the page to call later', async () => {
    const iframe = bind('later')
    const methods = { close() {}, disconnect() {} }
    iframe.iframeResizer = methods
    disconnect.mockImplementationOnce((el) => {
      delete el.iframeResizer
    })
    iframe.remove()
    await afterMutations()

    expect(iframe.iframeResizer).toBe(methods)
  })

  test('disconnects an iframe removed with the element around it', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const iframe = bind('nested', { parent: container })
    container.remove()
    await afterMutations()

    expect(disconnect).toHaveBeenCalledWith(iframe)
  })

  test('leaves an iframe moved within the page alone', async () => {
    const iframe = bind('moved')
    const elsewhere = document.createElement('div')
    document.body.append(elsewhere)
    elsewhere.append(iframe)
    await afterMutations()

    expect(disconnect).not.toHaveBeenCalled()
    expect(advise).not.toHaveBeenCalled()
  })

  test('leaves an iframe alone when disconnectOnRemove is false', async () => {
    const iframe = bind('kept', { disconnectOnRemove: false })
    iframe.remove()
    await afterMutations()

    expect(disconnect).not.toHaveBeenCalled()
  })

  test('ignores an iframe bound before it was added to the page', async () => {
    bind('detached', { parent: null })
    const other = document.createElement('p')
    document.body.append(other)
    other.remove()
    await afterMutations()

    expect(disconnect).not.toHaveBeenCalled()
  })

  test('does nothing once the page has disconnected the iframe itself', async () => {
    const iframe = bind('tidy')
    delete settings.tidy
    iframe.remove()
    await afterMutations()

    expect(disconnect).not.toHaveBeenCalled()
  })
})
