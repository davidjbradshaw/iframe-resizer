import { describe, expect, test, vi } from 'vitest'

vi.mock('../values/settings', () => ({
  default: {
    a: { initChild: vi.fn(), postMessageTarget: 'win' },
    b: { initChild: vi.fn(), postMessageTarget: 'other' },
  },
}))

const ready = (await import('./ready')).default
const { sendIframeReady } = await import('./ready')
const settings = (await import('../values/settings')).default

describe('core/send/ready', () => {
  test('sendIframeReady calls initChild only for matching source', () => {
    const fn = sendIframeReady('win')
    fn({
      initChild: settings.a.initChild,
      postMessageTarget: settings.a.postMessageTarget,
    })
    fn({
      initChild: settings.b.initChild,
      postMessageTarget: settings.b.postMessageTarget,
    })

    expect(settings.a.initChild).toHaveBeenCalled()
    expect(settings.b.initChild).not.toHaveBeenCalled()
  })

  test('default export iterates settings and calls when source matches', () => {
    ready('win')

    expect(settings.a.initChild).toHaveBeenCalled()
  })
})
