/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockResizer = {
  moveToAnchor: vi.fn(),
  resize: vi.fn(),
  sendMessage: vi.fn(),
  disconnect: vi.fn(),
}

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => () => mockResizer),
}))

vi.mock('auto-console-group', () => ({
  default: () => ({
    event: vi.fn(),
    label: vi.fn(),
    expand: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  }),
}))

import { createApp, nextTick } from 'vue'
import IframeResizer from './iframe-resizer.vue'

describe('Vue iframe-resizer mounted lifecycle', () => {
  let container
  let app

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    app?.unmount()
    container.remove()
    app = null
  })

  it('mounts and connects resizer', async () => {
    app = createApp(IframeResizer, { license: 'GPLv3', log: true })
    const vm = app.mount(container)
    await nextTick()

    expect(container.querySelector('iframe')).toBeTruthy()

    // Exposed methods delegate to the resizer
    vm.moveToAnchor('a')
    vm.resize()
    vm.sendMessage('m')

    expect(mockResizer.moveToAnchor).toHaveBeenCalledWith('a')
    expect(mockResizer.resize).toHaveBeenCalled()
    expect(mockResizer.sendMessage).toHaveBeenCalledWith('m', undefined)
  })

  it('renders an iframe element', async () => {
    app = createApp(IframeResizer, { license: 'GPLv3' })
    app.mount(container)
    await nextTick()

    expect(container.querySelector('iframe')).toBeTruthy()
  })

  it('beforeUnmount disconnects the resizer', async () => {
    app = createApp(IframeResizer, { license: 'GPLv3' })
    app.mount(container)
    await nextTick()

    app.unmount()
    app = null

    expect(mockResizer.disconnect).toHaveBeenCalled()
  })
})
