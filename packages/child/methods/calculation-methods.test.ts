import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

it('updates heightCalcMode and invokes checkHeightMode', async () => {
  vi.mock('../check/calculation-mode', () => ({
    checkHeightMode: vi.fn(),
    checkWidthMode: vi.fn(),
  }))
  const settings = (await import('../values/settings')).default
  const { setHeightCalculationMethod } = await import('./calculation-methods')
  const cm = await import('../check/calculation-mode')

  setHeightCalculationMethod('custom-height')
  expect(settings.heightCalcMode).toBe('custom-height')
  expect(cm.checkHeightMode).toHaveBeenCalled()
})

it('updates widthCalcMode and invokes checkWidthMode', async () => {
  vi.mock('../check/calculation-mode', () => ({
    checkHeightMode: vi.fn(),
    checkWidthMode: vi.fn(),
  }))
  const settings = (await import('../values/settings')).default
  const { setWidthCalculationMethod } = await import('./calculation-methods')
  const cm = await import('../check/calculation-mode')

  setWidthCalculationMethod('custom-width')
  expect(settings.widthCalcMode).toBe('custom-width')
  expect(cm.checkWidthMode).toHaveBeenCalled()
})
