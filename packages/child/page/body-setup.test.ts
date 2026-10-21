import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../check/both', () => ({ default: vi.fn(() => false) }))
vi.mock('./clear-fix', () => ({ default: vi.fn() }))
vi.mock('./content-width', () => ({ reapplyBodyWidth: vi.fn() }))
vi.mock('./css', () => ({ setBodyStyle: vi.fn(), setMargin: vi.fn() }))
vi.mock('./stop-infinite-resizing', () => ({ default: vi.fn() }))

const checkBoth = (await import('../check/both')).default
const injectClearFixIntoBodyElement = (await import('./clear-fix')).default
const { reapplyBodyWidth } = await import('./content-width')
const { setBodyStyle, setMargin } = await import('./css')
const stopInfiniteResizingOfIframe = (await import('./stop-infinite-resizing'))
  .default
const settings = (await import('../values/settings')).default
const applyBodySetup = (await import('./body-setup')).default
const { bodySetupSteps } = await import('./body-setup')

describe('child/page/body-setup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkBoth).mockReturnValue(false)
    settings.bodyBackground = 'red'
    settings.bodyPadding = '4px'
  })

  test('is the one list of body steps, with the width step given to it', () => {
    const setWidth = vi.fn()
    const steps = bodySetupSteps(setWidth)

    for (const step of steps) step()

    expect(setMargin).toHaveBeenCalledWith(settings)
    expect(setBodyStyle).toHaveBeenCalledWith('background', 'red')
    expect(setBodyStyle).toHaveBeenCalledWith('padding', '4px')
    expect(stopInfiniteResizingOfIframe).toHaveBeenCalled()
    expect(setWidth).toHaveBeenCalled()
    expect(injectClearFixIntoBodyElement).toHaveBeenCalled()
    // Isolated one by one by init, so each step has to be its own entry
    expect(steps).toHaveLength(6)
  })

  test('leaves the infinite-resize guard to both directions', () => {
    vi.mocked(checkBoth).mockReturnValue(true)

    for (const step of bodySetupSteps(vi.fn())) step()

    expect(stopInfiniteResizingOfIframe).not.toHaveBeenCalled()
  })

  test('re-applies the width override for a replaced body', () => {
    applyBodySetup()

    expect(reapplyBodyWidth).toHaveBeenCalled()
    expect(setMargin).toHaveBeenCalledWith(settings)
    expect(injectClearFixIntoBodyElement).toHaveBeenCalled()
  })
})
