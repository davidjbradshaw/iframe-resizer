/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockResizer = {
  disconnect: vi.fn(),
  moveToAnchor: vi.fn(),
  resize: vi.fn(),
  sendMessage: vi.fn(),
}

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => vi.fn(() => mockResizer)),
}))

vi.mock('auto-console-group', () => ({
  default: () => ({ event: vi.fn(), label: vi.fn(), expand: vi.fn(), log: vi.fn(), warn: vi.fn() }),
}))

import { flushSync, mount, unmount } from 'svelte'
import IframeResizer from './IframeResizer.svelte'
import connectResizer from '@iframe-resizer/core'

describe('Svelte IframeResizer lifecycle', () => {
  let target

  beforeEach(() => {
    target = document.createElement('div')
    document.body.append(target)
    vi.clearAllMocks()
  })

  afterEach(() => {
    target.remove()
  })

  it('mounts and calls connectResizer', () => {
    const component = mount(IframeResizer, {
      target,
      props: { license: 'GPLv3' },
    })
    flushSync()
    expect(connectResizer).toHaveBeenCalled()
    unmount(component)
  })

  it('calls disconnect on unmount', () => {
    const component = mount(IframeResizer, {
      target,
      props: { license: 'GPLv3' },
    })
    flushSync()
    unmount(component)
    expect(mockResizer.disconnect).toHaveBeenCalled()
  })

  it('exposes moveToAnchor method', () => {
    const component = mount(IframeResizer, {
      target,
      props: { license: 'GPLv3' },
    })
    flushSync()
    component.moveToAnchor('section-1')
    expect(mockResizer.moveToAnchor).toHaveBeenCalledWith('section-1')
    unmount(component)
  })

  it('exposes resize method', () => {
    const component = mount(IframeResizer, {
      target,
      props: { license: 'GPLv3' },
    })
    flushSync()
    component.resize()
    expect(mockResizer.resize).toHaveBeenCalled()
    unmount(component)
  })

  it('exposes sendMessage method', () => {
    const component = mount(IframeResizer, {
      target,
      props: { license: 'GPLv3' },
    })
    flushSync()
    component.sendMessage('hello', '*')
    expect(mockResizer.sendMessage).toHaveBeenCalledWith('hello', '*')
    unmount(component)
  })
})
