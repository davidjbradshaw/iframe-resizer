import { describe, test, expect } from 'vitest'

const ensureHasId = (await import('./id')).default

describe('core/checks/id', () => {
  test('assigns new id when missing', () => {
    const iframe = document.createElement('iframe')
    const id = ensureHasId(iframe, { id: 'x' })
    expect(id).toMatch(/x|Parent/) // new id created based on defaults or option
    expect(iframe.id).toBe(id)
  })
})
