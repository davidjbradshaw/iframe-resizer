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
vi.mock('./init', () => ({ setInitMessage: vi.fn() }))
vi.mock('./scrolling', () => ({ default: vi.fn() }))
vi.mock('../send/offset', () => ({ default: vi.fn() }))
vi.mock('../checks/options', () => ({
  default: vi.fn((_id, options) => options || {}),
}))
vi.mock('../values/settings', () => ({
  default: {} as Record<string, any>,
}))
vi.mock('@iframe-resizer/common', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  setMode: vi.fn(() => 42),
}))

const trigger = (await import('../send/trigger')).default
const createOutgoingMessage = (await import('../send/outgoing')).default
const meetsMinChildVersion = (await import('../checks/min-child-version'))
  .default
const setScrolling = (await import('./scrolling')).default
const setOffsetSize = (await import('../send/offset')).default
const { setInitMessage } = await import('./init')
const { advise, updateConsoleExpand } = await import('../console')
const settings = (await import('../values/settings')).default
const { setMode } = await import('@iframe-resizer/common')
const { default: updateIframe, sendPendingUpdate } = await import('./update')

describe('core/setup/update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(settings)) delete settings[key]
  })

  it('throws RangeError and skips dispatch when child version < 6', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(false)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    expect(() =>
      updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: true }),
    ).toThrow(RangeError)
    expect(trigger).not.toHaveBeenCalled()
    expect(settings.edge1.log).toBeUndefined()
  })

  describe('before the child has initialised', () => {
    const iframe = { id: 'edge1' } as HTMLIFrameElement

    beforeEach(() => {
      settings.edge1 = { mode: 0, direction: 'vertical', initialised: false }
    })

    it('merges the options at once and queues the update for the child', () => {
      const onReady = () => {}

      expect(() =>
        updateIframe(iframe, { tolerance: 5, scrolling: true, onReady }),
      ).not.toThrow()

      // Parent-side settings and effects are in place straight away
      expect(settings.edge1).toMatchObject({
        tolerance: 5,
        scrolling: true,
        onReady,
        updatePending: true,
      })
      expect(setScrolling).toHaveBeenCalledWith(iframe)
      // The init message now carries the new values, should it go out later
      expect(setInitMessage).toHaveBeenCalledWith('edge1')
      // Nothing is sent, and the child's version cannot be checked yet
      expect(trigger).not.toHaveBeenCalled()
      expect(meetsMinChildVersion).not.toHaveBeenCalled()
    })

    it('keeps the latest value of each option across several early updates', () => {
      updateIframe(iframe, { tolerance: 5, bodyBackground: 'red' })
      updateIframe(iframe, { tolerance: 7 })
      updateIframe(iframe, { bodyBackground: 'blue' })

      expect(settings.edge1).toMatchObject({
        tolerance: 7,
        bodyBackground: 'blue',
        updatePending: true,
      })
      expect(trigger).not.toHaveBeenCalled()
    })

    it('still throws on an invalid direction, leaving the settings as they were', () => {
      expect(() =>
        updateIframe(iframe, { direction: 'horizonal', tolerance: 5 }),
      ).toThrow('Direction value of "horizonal" is not valid')

      expect(settings.edge1).toMatchObject({
        direction: 'vertical',
        initialised: false,
      })
      expect(settings.edge1.tolerance).toBeUndefined()
      expect(settings.edge1.updatePending).toBeUndefined()
      expect(setInitMessage).not.toHaveBeenCalled()
    })

    it('queues an update made while the child page navigates', () => {
      // BEFORE_UNLOAD has reset initialised, the old page's version is known
      settings.edge1.childVersion = '6.0.0'

      updateIframe(iframe, { tolerance: 5 })

      expect(settings.edge1.tolerance).toBe(5)
      expect(settings.edge1.updatePending).toBe(true)
      expect(trigger).not.toHaveBeenCalled()
    })
  })

  describe('sendPendingUpdate', () => {
    it('sends the queued update once the child has initialised', () => {
      vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
      settings.edge1 = { initialised: true, updatePending: true }

      sendPendingUpdate('edge1')

      expect(createOutgoingMessage).toHaveBeenCalledWith('edge1')
      expect(trigger).toHaveBeenCalledWith(
        'update',
        'update:edge1:8:true:rest',
        'edge1',
      )
      expect(settings.edge1.updatePending).toBe(false)
      expect(advise).not.toHaveBeenCalled()
    })

    it('advises, rather than throws, when the child is older than v6', () => {
      vi.mocked(meetsMinChildVersion).mockReturnValueOnce(false)
      settings.edge1 = { initialised: true, updatePending: true }

      expect(() => sendPendingUpdate('edge1')).not.toThrow()

      expect(trigger).not.toHaveBeenCalled()
      expect(advise).toHaveBeenCalledWith(
        'edge1',
        expect.stringContaining('before v6'),
      )
      expect(settings.edge1.updatePending).toBe(false)
    })

    it('does nothing when no update was queued', () => {
      settings.edge1 = { initialised: true, updatePending: false }

      sendPendingUpdate('edge1')

      expect(trigger).not.toHaveBeenCalled()
      expect(advise).not.toHaveBeenCalled()
      expect(meetsMinChildVersion).not.toHaveBeenCalled()
    })

    it('does nothing for an iframe disconnected before the child initialised', () => {
      expect(() => sendPendingUpdate('gone')).not.toThrow()

      expect(trigger).not.toHaveBeenCalled()
      expect(advise).not.toHaveBeenCalled()
    })
  })

  it('throws on an invalid direction and leaves the settings as they were', () => {
    vi.mocked(meetsMinChildVersion)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
    settings.edge1 = {
      initialised: true,
      mode: 0,
      direction: 'horizontal-inline',
      sizeWidth: true,
      sizeHeight: false,
      tolerance: 0,
    }

    expect(() =>
      updateIframe({ id: 'edge1' } as HTMLIFrameElement, {
        direction: 'horizonal',
        tolerance: 5,
      }),
    ).toThrow('Direction value of "horizonal" is not valid')

    expect(settings.edge1).toMatchObject({
      direction: 'horizontal-inline',
      sizeWidth: true,
      sizeHeight: false,
      tolerance: 0,
    })
    expect(trigger).not.toHaveBeenCalled()

    // The bad value was not kept, so the next update goes through
    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { tolerance: 2 })
    expect(settings.edge1.tolerance).toBe(2)
    expect(trigger).toHaveBeenCalledTimes(1)
  })

  it('merges options into settings and dispatches UPDATE message', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = {
      initialised: true,
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
    expect(settings.edge1.updatePending).toBeUndefined()
    // A page loaded in the iframe later is initialised with the new values
    expect(setInitMessage).toHaveBeenCalledWith('edge1')
  })

  it('re-applies side-effect setup steps', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    const iframe = { id: 'edge1' } as HTMLIFrameElement
    updateIframe(iframe, { scrolling: false })

    expect(setScrolling).toHaveBeenCalledWith(iframe)
    expect(setOffsetSize).toHaveBeenCalledWith('edge1')
    expect(updateConsoleExpand).toHaveBeenCalledWith('edge1')
    // setDirection ran and re-derived flags from the (vertical) direction
    expect(settings.edge1.sizeWidth).toBe(false)
    expect(settings.edge1.sizeHeight).toBe(true)
  })

  it('re-derives size flags when direction changes', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, {
      direction: 'horizontal',
    })

    expect(settings.edge1.sizeWidth).toBe(true)
    expect(settings.edge1.sizeHeight).toBe(false)
  })

  it("keeps the child's autoResize, and its own, through an update", () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    // As the router records the child's parentIframe.autoResize(false)
    settings.edge1 = {
      initialised: true,
      mode: 0,
      direction: 'vertical',
      autoResize: true,
      childAutoResize: false,
    }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: true })

    // The parent's own setting is unchanged, so the message carries the same
    // value as before and the child keeps its own
    expect(settings.edge1.autoResize).toBe(true)
    expect(settings.edge1.childAutoResize).toBe(false)
  })

  it('expects the child to follow a change the parent makes', () => {
    vi.mocked(meetsMinChildVersion)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
    const iframe = { id: 'edge1' } as HTMLIFrameElement
    settings.edge1 = {
      initialised: true,
      mode: 0,
      direction: 'vertical',
      autoResize: true,
      childAutoResize: false,
    }

    updateIframe(iframe, { direction: 'none' })

    expect(settings.edge1.autoResize).toBe(false)
    expect(settings.edge1.childAutoResize).toBe(false)

    updateIframe(iframe, { direction: 'vertical' })

    // The parent's value changed, so the child adopts it
    expect(settings.edge1.autoResize).toBe(true)
    expect(settings.edge1.childAutoResize).toBe(true)
  })

  it('turns autoResize off for direction none, and back on after it', () => {
    vi.mocked(meetsMinChildVersion)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
    settings.edge1 = {
      initialised: true,
      mode: 0,
      direction: 'vertical',
      autoResize: true,
    }
    const iframe = { id: 'edge1' } as HTMLIFrameElement

    updateIframe(iframe, { direction: 'none' })
    expect(settings.edge1.autoResize).toBe(false)

    updateIframe(iframe, { direction: 'vertical' })
    expect(settings.edge1.autoResize).toBe(true)
  })

  it('still ignores the deprecated autoResize option', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = {
      initialised: true,
      mode: 0,
      direction: 'vertical',
      autoResize: true,
    }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { autoResize: false })

    expect(settings.edge1.autoResize).toBe(true)
  })

  it('translates deprecated option names', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    const onClose = () => {}
    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { onClose })

    expect(settings.edge1.onBeforeClose).toBe(onClose)
    expect('onClose' in settings.edge1).toBe(false)
  })

  it('does not flip mouseEvents to true when no mouse handlers passed', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = {
      initialised: true,
      mode: 0,
      direction: 'vertical',
      mouseEvents: false,
    }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: true })

    expect(settings.edge1.mouseEvents).toBe(false)
  })

  it('does not flip mouseEvents when mouse handler keys are present but undefined', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = {
      initialised: true,
      mode: 0,
      direction: 'vertical',
      mouseEvents: false,
    }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, {
      onMouseEnter: undefined,
      onMouseLeave: undefined,
    })

    expect(settings.edge1.mouseEvents).toBe(false)
  })

  it('normalizes string log values into a boolean and derives logExpand', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: 'expanded' })

    expect(settings.edge1.log).toBe(true)
    expect(settings.edge1.logExpand).toBe(true)
  })

  it('normalizes numeric LOG_DISABLED (0) to false', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: 0 })

    expect(settings.edge1.log).toBe(false)
  })

  it('normalizes numeric LOG_EXPANDED (2) to log:true and logExpand:true', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { log: 2 })

    expect(settings.edge1.log).toBe(true)
    expect(settings.edge1.logExpand).toBe(true)
  })

  it('re-derives mode when a license is passed', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { license: 'GPLv3' })

    expect(setMode).toHaveBeenCalledWith(
      expect.objectContaining({ license: 'GPLv3' }),
    )
    expect(settings.edge1.mode).toBe(42)
  })

  it('leaves mode alone when no license is passed', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { tolerance: 5 })

    expect(setMode).not.toHaveBeenCalled()
    expect(settings.edge1.mode).toBe(0)
  })

  it('converts a numeric bodyMargin to px, as setup does', () => {
    vi.mocked(meetsMinChildVersion).mockReturnValueOnce(true)
    settings.edge1 = { initialised: true, mode: 0, direction: 'vertical' }

    updateIframe({ id: 'edge1' } as HTMLIFrameElement, { bodyMargin: 12 })

    expect(settings.edge1.bodyMargin).toBe('12px')
  })
})
