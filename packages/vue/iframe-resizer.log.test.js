/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => () => ({ disconnect: vi.fn() })),
}))

vi.mock('auto-console-group', () => ({
  default: () => ({
    event: vi.fn(),
    label: vi.fn(),
    expand: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    endAutoGroup: vi.fn(),
  }),
}))

import connectResizer from '@iframe-resizer/core'
import { createApp, nextTick } from 'vue'
import IframeResizer from './iframe-resizer.vue'

describe('Vue iframe-resizer log prop', () => {
  let container
  let app
  let warn

  beforeEach(() => {
    vi.clearAllMocks()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    app?.unmount()
    container.remove()
    warn.mockRestore()
  })

  async function mount(log) {
    app = createApp(IframeResizer, { license: 'GPLv3', log })
    app.mount(container)
    await nextTick()
    return connectResizer.mock.calls.at(-1)[0]
  }

  it('reads a bare log attribute as true', async () => {
    // What <IframeResizer log /> passes
    const options = await mount('')

    expect(options.log).toBe(true)
    expect(warn).not.toHaveBeenCalled()
  })

  it('still passes a named log value through', async () => {
    const options = await mount('expanded')

    expect(options.log).toBe('expanded')
    expect(warn).not.toHaveBeenCalled()
  })
})
