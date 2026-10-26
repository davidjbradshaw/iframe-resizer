import { ENABLE, SET_OFFSET_SIZE } from '@iframe-resizer/common/consts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import settings from '../values/settings'
import state from '../values/state'

vi.mock('../send/size', () => ({ default: vi.fn() }))
vi.mock('../console', () => ({
  errorBoundary: (fn: any) => fn,
  event: vi.fn(),
  log: vi.fn(),
  setConsoleOptions: vi.fn(),
  warn: vi.fn(),
}))
vi.mock('../events/mouse', () => ({ default: vi.fn() }))
vi.mock('../page/css', () => ({
  setBodyStyle: vi.fn(),
  setMargin: vi.fn(),
}))
vi.mock('../page/links', () => ({ default: vi.fn() }))
vi.mock('../page/content-width', () => ({ default: vi.fn() }))

const updateMod = await import('./update')
const updateFromParent = updateMod.default
const { applyFromParent } = updateMod
const consoleMod = await import('../console')
const setupMouseEvents = (await import('../events/mouse')).default
const cssMod = await import('../page/css')
const setupInPageLinks = (await import('../page/links')).default
const setContentWidth = (await import('../page/content-width')).default
const sendSize = (await import('../send/size')).default

const buildEvent = (id: string, fields: Record<string, any>): MessageEvent => {
  // Wire format mirrors createOutgoingMessage on the parent side, prefixed
  // with the iframeResizer header and the "update:" event type.
  const data = [
    id,
    '8',
    fields.sizeWidth ?? 'false',
    fields.logging ?? 'false',
    '32',
    'true',
    fields.autoResize ?? 'true',
    '0',
    'auto',
    '',
    '',
    fields.tolerance ?? '0',
    fields.inPageLinks ?? 'false',
    'child',
    'auto',
    fields.mouseEvents ?? 'false',
    // A parent with no offsetSize of its own sends empty fields
    fields.offsetHeight ?? '',
    fields.offsetWidth ?? '',
    fields.sizeHeight ?? 'true',
    '',
    '',
    fields.mode ?? '0',
    '',
    fields.logExpand ?? 'false',
    fields.maxContentWidth ?? 'false',
    ...(fields.bindId === undefined ? [] : [fields.bindId]),
  ].join(':')
  return { data: `[iFrameSizer]update:${data}` } as MessageEvent
}

describe('child/received/update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    settings.mouseEvents = false
    settings.inPageLinks = false
    settings.logging = false
    settings.bodyBackground = ''
    settings.bodyMarginStr = ''
    settings.bodyPadding = ''
    settings.offsetHeight = 0
    settings.offsetWidth = 0
    settings.autoResize = true
    state.pageSettings = []
    state.fromParent = {}
  })

  it("keeps the child's own licence mode over the parent's", () => {
    settings.mode = 5

    updateFromParent(buildEvent('x', { mode: '-2' }))

    expect(settings.mode).toBe(5)
  })

  it('records the binding the options came from', () => {
    updateFromParent(buildEvent('x', { bindId: 'k3x9' }))

    expect(settings.bindId).toBe('k3x9')
  })

  it('sends no size for a new binding, as its init reply carries one', async () => {
    settings.autoResize = false
    state.fromParent = { autoResize: false }
    const fields = (event: MessageEvent) =>
      event.data.slice('[iFrameSizer]update:'.length).split(':')

    applyFromParent(
      fields(buildEvent('x', { autoResize: 'true', offsetHeight: '50' })),
      true,
    )
    await Promise.resolve()

    expect(settings.offsetHeight).toBe(50)
    expect(sendSize).not.toHaveBeenCalled()
  })

  it('re-measures when the parent re-enables autoResize', async () => {
    settings.autoResize = false
    state.fromParent = { autoResize: false }

    updateFromParent(buildEvent('frame', { autoResize: 'true' }))

    expect(settings.autoResize).toBe(true)
    // The send is queued as a microtask, as parentIframe.autoResize(true) does
    await Promise.resolve()
    expect(sendSize).toHaveBeenCalledWith(
      ENABLE,
      'Auto Resize enabled by parent',
    )
  })

  it("lets the parent's offset through for an axis it has just started sizing", () => {
    // The page set an offset while only the height was calculated, so the
    // width's offset was zeroed and the height's is the page's own
    settings.offsetHeight = 50
    settings.offsetWidth = 0
    state.fromParent = {
      autoResize: true,
      calculateHeight: true,
      calculateWidth: false,
      offsetHeight: 0,
      offsetWidth: 0,
    }

    updateFromParent(buildEvent('frame', { sizeWidth: 'true' }))

    expect(settings.calculateWidth).toBe(true)
    // The width axis changed, so the parent's value for it goes through
    expect(settings.offsetWidth).toBe(0)
    // The height axis did not, so the page's offset for it survives
    expect(settings.offsetHeight).toBe(50)
  })

  it('keeps both offsets when neither axis changes', () => {
    settings.offsetHeight = 50
    settings.offsetWidth = 20
    state.fromParent = {
      autoResize: true,
      calculateHeight: true,
      calculateWidth: true,
      offsetHeight: 0,
      offsetWidth: 0,
    }

    updateFromParent(buildEvent('frame', { sizeWidth: 'true', tolerance: '5' }))

    expect(settings.tolerance).toBe(5)
    expect(settings.offsetHeight).toBe(50)
    expect(settings.offsetWidth).toBe(20)
  })

  it('re-sends the size when the offset changes, as setOffsetSize does', () => {
    updateFromParent(buildEvent('edge1', { offsetHeight: '100' }))

    expect(settings.offsetHeight).toBe(100)
    expect(sendSize).toHaveBeenCalledWith(SET_OFFSET_SIZE, expect.any(String))
  })

  it('receives the maxContentWidth flag and re-applies the content width', () => {
    settings.maxContentWidth = false

    updateFromParent(
      buildEvent('frame', { sizeWidth: 'true', maxContentWidth: 'true' }),
    )

    expect(settings.calculateWidth).toBe(true)
    expect(settings.maxContentWidth).toBe(true)
    expect(setContentWidth).toHaveBeenCalledTimes(1)

    settings.calculateWidth = false
    settings.maxContentWidth = false
  })

  it('does not re-send the size when the offset is unchanged', () => {
    settings.offsetHeight = 100

    updateFromParent(buildEvent('edge1', { offsetHeight: '100' }))

    expect(sendSize).not.toHaveBeenCalled()
  })

  it('ignores parent values for options the page set itself', () => {
    state.pageSettings = ['offsetHeight', 'offsetWidth']
    settings.offsetHeight = 50

    updateFromParent(buildEvent('edge1', { offsetHeight: '100' }))

    expect(settings.offsetHeight).toBe(50)
    expect(sendSize).not.toHaveBeenCalled()
  })

  it('keeps an offset the page set with setOffsetSize() while the parent sends the same one', () => {
    state.fromParent = {
      calculateHeight: true,
      calculateWidth: false,
      offsetHeight: 50,
      offsetWidth: undefined,
    }
    settings.offsetHeight = 50

    updateFromParent(buildEvent('edge1', { offsetHeight: '50' }))

    expect(settings.offsetHeight).toBe(50)
    expect(sendSize).not.toHaveBeenCalled()
  })

  it('clears the offset the page set when the parent sends one of zero', () => {
    // An update from a parent with no offsetSize of its own, whose empty
    // field is not the zero it sends to clear the offset the page set
    updateFromParent(buildEvent('edge1', { logging: 'true' }))
    settings.offsetHeight = 50
    vi.clearAllMocks()

    updateFromParent(buildEvent('edge1', { offsetHeight: '0' }))

    expect(settings.offsetHeight).toBe(0)
    expect(sendSize).toHaveBeenCalledWith(SET_OFFSET_SIZE, expect.any(String))
  })

  it('applies an offset the parent has changed over the one the page set', () => {
    state.fromParent = { offsetHeight: 0, offsetWidth: 0 }
    settings.offsetHeight = 50

    updateFromParent(buildEvent('edge1', { offsetHeight: '100' }))

    expect(settings.offsetHeight).toBe(100)
    expect(sendSize).toHaveBeenCalledWith(SET_OFFSET_SIZE, expect.any(String))
  })

  it('keeps autoResize off when the page turned it off and the parent sends the same value', () => {
    state.fromParent = { autoResize: true }
    settings.autoResize = false

    updateFromParent(buildEvent('edge1', { autoResize: 'true' }))

    expect(settings.autoResize).toBe(false)
  })

  it('updates console settings on every update', () => {
    const event = buildEvent('edge1', {
      logging: 'true',
      logExpand: 'true',
    })
    updateFromParent(event)

    expect(settings.logging).toBe(true)
    expect(settings.logExpand).toBe(true)
    expect(consoleMod.setConsoleOptions).toHaveBeenCalledWith({
      id: settings.parentId,
      enabled: true,
      expand: true,
    })
  })

  it('does not touch body styles when they are unchanged', () => {
    // Match the values the buildEvent fixture will deliver so previous === incoming
    settings.bodyBackground = ''
    settings.bodyMarginStr = '0'
    settings.bodyPadding = ''

    updateFromParent(buildEvent('edge1', {}))

    expect(cssMod.setMargin).not.toHaveBeenCalled()
    expect(cssMod.setBodyStyle).not.toHaveBeenCalled()
  })

  it('calls setupMouseEvents only when mouseEvents transitions false → true', () => {
    settings.mouseEvents = false

    updateFromParent(buildEvent('edge1', { mouseEvents: 'true' }))
    expect(setupMouseEvents).toHaveBeenCalledTimes(1)

    // already true, second update with the same value should not re-attach
    updateFromParent(buildEvent('edge1', { mouseEvents: 'true' }))
    expect(setupMouseEvents).toHaveBeenCalledTimes(1)
  })

  it('does not call setupMouseEvents when mouseEvents stays false', () => {
    settings.mouseEvents = false

    updateFromParent(buildEvent('edge1', { mouseEvents: 'false' }))
    expect(setupMouseEvents).not.toHaveBeenCalled()
  })

  it('calls setupInPageLinks only when inPageLinks transitions false → true', () => {
    settings.inPageLinks = false

    updateFromParent(buildEvent('edge1', { inPageLinks: 'true' }))
    expect(setupInPageLinks).toHaveBeenCalledWith(true)
    expect(setupInPageLinks).toHaveBeenCalledTimes(1)

    updateFromParent(buildEvent('edge1', { inPageLinks: 'true' }))
    expect(setupInPageLinks).toHaveBeenCalledTimes(1)
  })
})
