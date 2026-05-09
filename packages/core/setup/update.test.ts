import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('../send/outgoing', () => ({
  default: vi.fn(() => 'edge1:8:true:rest'),
}))
vi.mock('../checks/min-child-version', () => ({ default: vi.fn() }))
vi.mock('../console', () => ({
  error: vi.fn(),
  event: vi.fn(),
  log: vi.fn(),
}))
vi.mock('./target-origin', () => ({ setTargetOrigin: vi.fn() }))
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
