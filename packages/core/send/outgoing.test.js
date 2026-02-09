import { describe, test, expect, vi } from 'vitest'

vi.mock('../values/page', () => ({ default: { version: '5' } }))
vi.mock('../values/settings', () => ({ default: { abc: { autoResize: true, bodyBackground: '#fff', bodyMargin: 8, bodyPadding: '0', heightCalculationMethod: 'auto', inPageLinks: true, license: 'MIT', log: true, logExpand: false, mouseEvents: true, offsetHeight: 1, offsetWidth: 2, mode: 0, sizeHeight: true, sizeWidth: false, tolerance: 0, widthCalculationMethod: 'scroll' } } }))

const createOutgoingMessage = (await import('./outgoing')).default

describe('core/send/outgoing', () => {
  test('creates expected outgoing message string', () => {
    const msg = createOutgoingMessage('abc')
    expect(typeof msg).toBe('string')
    expect(msg.split(':').length).toBeGreaterThan(10)
    expect(msg.startsWith('abc:')).toBe(true)
  })
})
