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

describe('Vue iframe-resizer prop types', () => {
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

  async function mount(props) {
    app = createApp(IframeResizer, { license: 'GPLv3', ...props })
    app.mount(container)
    await nextTick()
    return connectResizer.mock.calls.at(-1)[0]
  }

  it('takes the values core does, without warnings', async () => {
    const values = {
      bodyMargin: 0,
      bodyPadding: '8px',
      checkOrigin: ['https://a.example'],
      scrolling: 'auto',
    }

    const options = await mount(values)

    expect(options).toMatchObject(values)
    expect(warn).not.toHaveBeenCalled()
  })

  it('reads bare checkOrigin and scrolling attributes as true', async () => {
    const options = await mount({ checkOrigin: '', scrolling: '' })

    expect(options).toMatchObject({ checkOrigin: true, scrolling: true })
    expect(warn).not.toHaveBeenCalled()
  })
})
