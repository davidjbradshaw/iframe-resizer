import { vi } from 'vitest'

import { advise, event } from '../console'
import warnOnNoResponse from './timeout'

// Mock console integration used by showWarning
vi.mock('../console', () => ({
  advise: vi.fn(),
  event: vi.fn(),
}))

describe('warnOnNoResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(global, 'setTimeout')
    vi.spyOn(global, 'clearTimeout')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const makeSettings = ({
    id = 'frame1',
    src = 'https://example.com/path',
    sandbox,
    checkOrigin = true,
    waitForLoad = false,
    initialised = false,
    initialisedFirstPage = false,
    loadErrorShown = false,
    warningTimeout = 50,
    msgTimeout,
  } = {}) => ({
    [id]: {
      iframe: { id, src, sandbox },
      checkOrigin,
      waitForLoad,
      initialised,
      initialisedFirstPage,
      loadErrorShown,
      warningTimeout,
      msgTimeout,
    },
  })

  it('schedules a warning and includes origin when checkOrigin is true', () => {
    const id = 'f1'
    const settings = makeSettings({
      id,
      src: 'https://foo.example:8443/a/b',
      checkOrigin: true,
    })

    warnOnNoResponse(id, settings)

    expect(setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      settings[id].warningTimeout,
    )

    vi.advanceTimersByTime(settings[id].warningTimeout + 1)

    expect(event).toHaveBeenCalledWith(id, 'noResponse')
    expect(advise).toHaveBeenCalledTimes(1)
    expect(advise).toHaveBeenCalledWith(
      id,
      expect.stringMatching(/No response from iframe/),
    )

    expect(advise).toHaveBeenCalledWith(
      id,
      expect.stringContaining('https://foo.example:8443'),
    )
  })

  it('omits checkOrigin advice when checkOrigin is false', () => {
    const id = 'f2'
    const settings = makeSettings({ id, checkOrigin: false })

    warnOnNoResponse(id, settings)
    vi.advanceTimersByTime(settings[id].warningTimeout + 1)

    expect(advise).toHaveBeenCalledWith(
      id,
      expect.not.stringMatching(/checkOrigin/),
    )
  })

  it('adds sandbox advice when sandbox is present but missing required tokens', () => {
    const id = 'f3'
    const sandbox = {
      length: 1,
      contains(token) {
        // only allow-scripts present; missing allow-same-origin
        return token === 'allow-scripts'
      },
    }
    const settings = makeSettings({ id, sandbox })

    warnOnNoResponse(id, settings)
    vi.advanceTimersByTime(settings[id].warningTimeout + 1)

    expect(advise).toHaveBeenCalledWith(id, expect.stringMatching(/sandbox/))
    expect(advise).toHaveBeenCalledWith(
      id,
      expect.stringMatching(/allow-same-origin/),
    )

    expect(advise).toHaveBeenCalledWith(
      id,
      expect.stringMatching(/allow-scripts/),
    )
  })

  it('includes waitForLoad advice when enabled and first page not initialised', () => {
    const id = 'f4'
    const settings = makeSettings({
      id,
      waitForLoad: true,
      initialisedFirstPage: false,
    })

    warnOnNoResponse(id, settings)
    vi.advanceTimersByTime(settings[id].warningTimeout + 1)

    expect(advise).toHaveBeenCalledWith(
      id,
      expect.stringMatching(/waitForLoad/),
    )
  })

  it('when already initialised: sets initialisedFirstPage and does not warn', () => {
    const id = 'f5'
    const settings = makeSettings({
      id,
      initialised: true,
      initialisedFirstPage: false,
    })

    warnOnNoResponse(id, settings)
    vi.advanceTimersByTime(settings[id].warningTimeout + 1)

    expect(settings[id].initialisedFirstPage).toBe(true)
    expect(advise).not.toHaveBeenCalled()
  })

  it('does not schedule when warningTimeout is 0', () => {
    const id = 'f7'
    const settings = makeSettings({ id, warningTimeout: 0 })

    warnOnNoResponse(id, settings)

    expect(setTimeout).not.toHaveBeenCalled()
    expect(settings[id].msgTimeout).toBeUndefined()
    expect(advise).not.toHaveBeenCalled()
  })

  it('replaces an existing timeout if called again', () => {
    const id = 'f8'
    const settings = makeSettings({ id, warningTimeout: 100 })

    warnOnNoResponse(id, settings)
    const first = settings[id].msgTimeout

    expect(first).toBeDefined()

    warnOnNoResponse(id, settings)
    const second = settings[id].msgTimeout

    expect(clearTimeout).toHaveBeenCalledWith(first)
    expect(second).toBeDefined()
    expect(second).not.toBe(first)
  })

  it('does not include origin when URL parsing fails', () => {
    const id = 'f9'
    const settings = makeSettings({ id, src: '::::not-a-url' })

    warnOnNoResponse(id, settings)
    vi.advanceTimersByTime(settings[id].warningTimeout + 1)

    expect(advise).toHaveBeenCalledWith(
      id,
      expect.not.stringMatching(/checkOrigin/),
    )
  })

  it('does not warn when iframe is removed from settings before timeout fires', () => {
    const id = 'f10'
    const settings = makeSettings({ id, warningTimeout: 100 })

    warnOnNoResponse(id, settings)

    expect(setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      settings[id].warningTimeout,
    )

    // Simulate iframe being closed/removed from settings
    delete settings[id]

    vi.advanceTimersByTime(100 + 1)

    // Should not warn or throw error when iframe is no longer in settings
    expect(advise).not.toHaveBeenCalled()
    expect(event).not.toHaveBeenCalled()
  })

  it('does not warn again when loadErrorShown is already true', () => {
    const id = 'f11'
    const settings = makeSettings({
      id,
      loadErrorShown: true,
      warningTimeout: 100,
    })

    warnOnNoResponse(id, settings)

    vi.advanceTimersByTime(settings[id].warningTimeout + 1)

    // Should not warn or fire event when error was already shown
    expect(advise).not.toHaveBeenCalled()
    expect(event).not.toHaveBeenCalled()
  })
})
