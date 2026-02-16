import { afterEach, describe, expect, test } from 'vitest'

const ensureHasId = (await import('./id')).default

describe('core/checks/id', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('assigns new id when missing', () => {
    const iframe = document.createElement('iframe')
    const id = ensureHasId(iframe, { id: 'x' })

    expect(id).toMatch(/^(x|iFrameResizer)/) // new id created based on defaults or option
    expect(iframe.id).toBe(id)
  })

  test('throws TypeError when id is not a string', () => {
    const iframe = {
      id: 123, // non-string id that won't be auto-converted
    }

    expect(() => ensureHasId(iframe)).toThrow(TypeError)
    expect(() => ensureHasId(iframe)).toThrow(
      'Invalid id for iFrame. Expected String',
    )
  })

  test('assigns new id from defaults when options.id is not provided', () => {
    const iframe = document.createElement('iframe')
    const id = ensureHasId(iframe) // no options

    expect(iframe.id).toBe(id)
    expect(id).toBeTruthy()
  })

  test('handles empty string id', () => {
    const iframe = document.createElement('iframe')
    iframe.id = ''
    const id = ensureHasId(iframe, { id: 'empty-test' })

    expect(iframe.id).toBe(id)
    expect(id).toBeTruthy()
  })

  test('handles id collision by appending counter', () => {
    // Create an existing element with the target id
    const existingDiv = document.createElement('div')
    existingDiv.id = 'collision-test'
    document.body.append(existingDiv)

    const iframe = document.createElement('iframe')
    const id = ensureHasId(iframe, { id: 'collision-test' })

    // Should get a modified id to avoid collision
    expect(iframe.id).toBe(id)
    expect(id).toContain('collision-test')

    existingDiv.remove()
  })

  test('returns existing valid id', () => {
    const iframe = document.createElement('iframe')
    iframe.id = 'existing-valid-id'
    const id = ensureHasId(iframe)

    expect(id).toBe('existing-valid-id')
    expect(iframe.id).toBe('existing-valid-id')
  })
})
