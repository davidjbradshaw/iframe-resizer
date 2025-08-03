import { IGNORE_ATTR } from '../common/consts'

describe('data-iframe-ignore attribute constants', () => {
  beforeEach(() => {
    // Clean up DOM before each test
    document.body.replaceChildren()
  })

  test('should have correct IGNORE_ATTR constant', () => {
    expect(IGNORE_ATTR).toBe('data-iframe-ignore')
  })

  test('should be able to query elements with ignore attribute', () => {
    // Create test DOM programmatically
    const normalElement = document.createElement('div')
    normalElement.id = 'normal'
    normalElement.textContent = 'Normal element'

    const ignoredElement = document.createElement('div')
    ignoredElement.id = 'ignored'
    ignoredElement.textContent = 'Ignored element'
    ignoredElement.setAttribute(IGNORE_ATTR, '')

    document.body.append(normalElement, ignoredElement)

    // Test querySelector works with the attribute
    const ignoredElements = document.querySelectorAll(`*[${IGNORE_ATTR}]`)

    expect(ignoredElements).toHaveLength(1)
    expect(ignoredElements[0]).toBe(ignoredElement)
    expect(normalElement.hasAttribute(IGNORE_ATTR)).toBe(false)
    expect(ignoredElement.hasAttribute(IGNORE_ATTR)).toBe(true)
  })

  test('should support adding and removing ignore attribute', () => {
    const element = document.createElement('div')
    document.body.append(element)

    // Initially no ignore attribute
    expect(element.hasAttribute(IGNORE_ATTR)).toBe(false)
    expect(document.querySelectorAll(`*[${IGNORE_ATTR}]`)).toHaveLength(0)

    // Add ignore attribute
    element.setAttribute(IGNORE_ATTR, '')

    expect(element.hasAttribute(IGNORE_ATTR)).toBe(true)
    expect(document.querySelectorAll(`*[${IGNORE_ATTR}]`)).toHaveLength(1)

    // Remove ignore attribute
    element.removeAttribute(IGNORE_ATTR)

    expect(element.hasAttribute(IGNORE_ATTR)).toBe(false)
    expect(document.querySelectorAll(`*[${IGNORE_ATTR}]`)).toHaveLength(0)
  })
})
