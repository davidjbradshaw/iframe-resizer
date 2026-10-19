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
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import IframeResizer from './iframe-resizer.vue'

describe('Vue iframe-resizer re-binding', () => {
  let container
  let app

  beforeEach(() => {
    vi.clearAllMocks()
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(() => {
    app?.unmount()
    container.remove()
  })

  it('re-binds when a value changes, not on every parent render', async () => {
    const host = ref('https://a.example')
    const count = ref(0)

    // checkOrigin is a new array each time the parent renders
    const Parent = defineComponent({
      setup: () => () =>
        h('div', [
          h('span', count.value),
          h(IframeResizer, { license: 'GPLv3', checkOrigin: [host.value] }),
        ]),
    })

    app = createApp(Parent)
    app.mount(container)
    await nextTick()

    expect(connectResizer).toHaveBeenCalledTimes(1)

    count.value += 1
    await nextTick()
    await nextTick()

    expect(connectResizer).toHaveBeenCalledTimes(1)

    host.value = 'https://b.example'
    await nextTick()
    await nextTick()

    expect(connectResizer).toHaveBeenCalledTimes(2)
    expect(connectResizer).toHaveBeenLastCalledWith(
      expect.objectContaining({ checkOrigin: ['https://b.example'] }),
    )
  })

  it('passes an id change to core, so it can report the error', async () => {
    const id = ref('first')

    const Parent = defineComponent({
      setup: () => () =>
        h('div', [h(IframeResizer, { license: 'GPLv3', id: id.value })]),
    })

    app = createApp(Parent)
    app.mount(container)
    await nextTick()

    expect(connectResizer).toHaveBeenCalledTimes(1)

    id.value = 'renamed'
    await nextTick()
    await nextTick()

    expect(connectResizer).toHaveBeenCalledTimes(2)
  })
})
