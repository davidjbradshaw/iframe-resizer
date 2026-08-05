import { beforeEach, describe, expect, it, vi } from 'vitest'

import settings from '../values/settings'

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

const updateFromParent = (await import('./update')).default
const consoleMod = await import('../console')
const setupMouseEvents = (await import('../events/mouse')).default
const cssMod = await import('../page/css')
const setupInPageLinks = (await import('../page/links')).default

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
    '0',
    '0',
    fields.sizeHeight ?? 'true',
    '',
    '',
    '0',
    '',
    fields.logExpand ?? 'false',
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
