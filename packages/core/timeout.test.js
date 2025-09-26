import { advise, event } from './console'
import warnOnNoResponse from './timeout'

// Mock console integration used by showWarning
jest.mock('./console', () => ({
  advise: jest.fn(),
  event: jest.fn(),
}))

describe('warnOnNoResponse', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(global, 'setTimeout')
    jest.spyOn(global, 'clearTimeout')
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
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
      iframe: { src, sandbox },
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

    expect(setTimeout).toHaveBeenCalled()

    jest.advanceTimersByTime(settings[id].warningTimeout + 1)

    expect(event).toHaveBeenCalledWith(id, 'noResponse')
    expect(advise).toHaveBeenCalledTimes(1)
    const [, message] = advise.mock.calls[0]

    expect(message).toMatch(/No response from iframe/)
    expect(message).toContain('https://foo.example:8443')
    expect(settings[id].loadErrorShown).toBe(true)
  })

  it('omits checkOrigin advice when checkOrigin is false', () => {
    const id = 'f2'
    const settings = makeSettings({ id, checkOrigin: false })

    warnOnNoResponse(id, settings)
    jest.advanceTimersByTime(settings[id].warningTimeout + 1)

    const [, message] = advise.mock.calls[0]

    expect(message).not.toMatch(/checkOrigin/)
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
    jest.advanceTimersByTime(settings[id].warningTimeout + 1)

    const [, message] = advise.mock.calls[0]

    expect(message).toMatch(/sandbox/)
    expect(message).toMatch(/allow-same-origin/)
    expect(message).toMatch(/allow-scripts/)
  })

  it('includes waitForLoad advice when enabled and first page not initialised', () => {
    const id = 'f4'
    const settings = makeSettings({
      id,
      waitForLoad: true,
      initialisedFirstPage: false,
    })

    warnOnNoResponse(id, settings)
    jest.advanceTimersByTime(settings[id].warningTimeout + 1)

    const [, message] = advise.mock.calls[0]

    expect(message).toMatch(/waitForLoad/)
  })

  it('when already initialised: sets initialisedFirstPage and does not warn', () => {
    const id = 'f5'
    const settings = makeSettings({
      id,
      initialised: true,
      initialisedFirstPage: false,
    })

    warnOnNoResponse(id, settings)
    jest.advanceTimersByTime(settings[id].warningTimeout + 1)

    expect(settings[id].initialisedFirstPage).toBe(true)
    expect(advise).not.toHaveBeenCalled()
  })

  it('does nothing if loadErrorShown is already true', () => {
    const id = 'f6'
    const settings = makeSettings({ id, loadErrorShown: true })

    warnOnNoResponse(id, settings)
    jest.advanceTimersByTime(settings[id].warningTimeout + 1)

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
    jest.advanceTimersByTime(settings[id].warningTimeout + 1)

    const [, message] = advise.mock.calls[0]

    expect(message).not.toMatch(/checkOrigin/)
  })
})
