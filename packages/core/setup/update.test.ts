import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('../send/outgoing', () => ({
  default: vi.fn(() => 'edge1:8:true:rest'),
}))
vi.mock('../checks/min-child-version', () => ({ default: vi.fn() }))
vi.mock('../console', () => ({
  advise: vi.fn(),
  error: vi.fn(),
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  updateConsoleExpand: vi.fn(),
}))
vi.mock('./target-origin', () => ({ setTargetOrigin: vi.fn() }))
vi.mock('./scrolling', () => ({ default: vi.fn() }))
vi.mock('../send/offset', () => ({ default: vi.fn() }))
vi.mock('../checks/options', () => ({
  default: vi.fn((_id, options) => options || {}),
}))
vi.mock('../values/settings', () => ({
  default: {} as Record<string, any>,
}))

const trigger = (await import('../send/trigger')).default
const createOutgoingMessage = (await import('../send/outgoing')).default
const meetsMinChildVersion = (await import('../checks/min-child-version'))
  .default
const setScrolling = (await import('./scrolling')).default
const setOffsetSize = (await import('../send/offset')).default
const { updateConsoleExpand } = await import('../console')
const settings = (await import('../values/settings')).default
const updateIframe = (await import('./update')).default

describe('core/setup/update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(settings)) delete settings[key]
  })

  it('throws RangeError and skips dispatch when child version < 6', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(false)
    settings.edge1 = { mode: 0, direction: 'vertical' }

    expect(() =>
      updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: true }),
    ).toThrow(RangeError)
    expect(trigger).not.toHaveBeenCalled()
  })

  it('merges options into settings and dispatches UPDATE message', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = {
      mode: 0,
      direction: 'vertical',
      log: false,
      mouseEvents: false,
    }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, {
      log: true,
      onMouseEnter: () => {},
    })

    // Setting was merged
    expect(settings.edge1.log).toBe(true)
    expect(settings.edge1.mouseEvents).toBe(true)
    // Outgoing message built and dispatched with update: prefix
    expect(createOutgoingMessage).toHaveBeenCalledWith('edge1')
    expect(trigger).toHaveBeenCalledWith(
      'update',
      'update:edge1:8:true:rest',
      'edge1',
    )
  })

  it('re-applies side-effect setup steps', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { mode: 0, direction: 'vertical' }

    const iframe = { id: 'edge1' } as HTMLIFrameElement
    updateIframe(iframe, { scrolling: false })

    expect(setScrolling).toHaveBeenCalledWith(iframe)
    expect(setOffsetSize).toHaveBeenCalledWith('edge1', { scrolling: false })
    expect(updateConsoleExpand).toHaveBeenCalledWith('edge1')
    // setDirection ran and re-derived flags from the (vertical) direction
    expect(settings.edge1.sizeWidth).toBe(false)
    expect(settings.edge1.sizeHeight).toBe(true)
  })

  it('re-derives size flags when direction changes', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, {
      direction: 'horizontal',
    })

    expect(settings.edge1.sizeWidth).toBe(true)
    expect(settings.edge1.sizeHeight).toBe(false)
  })

  it('translates deprecated option names', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { mode: 0, direction: 'vertical' }

    const onClose = () => {}
    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { onClose })

    expect(settings.edge1.onBeforeClose).toBe(onClose)
    expect('onClose' in settings.edge1).toBe(false)
  })

  it('does not flip mouseEvents to true when no mouse handlers passed', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { mode: 0, direction: 'vertical', mouseEvents: false }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: true })

    expect(settings.edge1.mouseEvents).toBe(false)
  })

  it('does not flip mouseEvents when mouse handler keys are present but undefined', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { mode: 0, direction: 'vertical', mouseEvents: false }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, {
      onMouseEnter: undefined,
      onMouseLeave: undefined,
    })

    expect(settings.edge1.mouseEvents).toBe(false)
  })

  it('normalizes string log values into a boolean and derives logExpand', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: 'expanded' })

    expect(settings.edge1.log).toBe(true)
    expect(settings.edge1.logExpand).toBe(true)
  })

  it('normalizes numeric LOG_DISABLED (0) to false', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: 0 })

    expect(settings.edge1.log).toBe(false)
  })

  it('normalizes numeric LOG_EXPANDED (2) to log:true and logExpand:true', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: 2 })

    expect(settings.edge1.log).toBe(true)
    expect(settings.edge1.logExpand).toBe(true)
  })
})
