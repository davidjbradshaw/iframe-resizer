import { IGNORE_ATTR } from '../common/consts'

describe('data-iframe-ignore attribute constants', () => {
  beforeEach(() => {
    // Clean up DOM before each test
    document.body.innerHTML = ''
  })

  test('should have correct IGNORE_ATTR constant', () => {
    expect(IGNORE_ATTR).toBe('data-iframe-ignore')
  })

  test('should be able to query elements with ignore attribute', () => {
    // Create test DOM
    document.body.innerHTML = `
      <div id="normal">Normal element</div>
      <div id="ignored" ${IGNORE_ATTR}>Ignored element</div>
    `

    const normalElement = document.getElementById('normal')
    const ignoredElement = document.getElementById('ignored')

    // Test querySelector works with the attribute
    const ignoredElements = document.querySelectorAll(`*[${IGNORE_ATTR}]`)
    
    expect(ignoredElements.length).toBe(1)
    expect(ignoredElements[0]).toBe(ignoredElement)
    expect(normalElement.hasAttribute(IGNORE_ATTR)).toBe(false)
    expect(ignoredElement.hasAttribute(IGNORE_ATTR)).toBe(true)
  })

  test('should support adding and removing ignore attribute', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)

    // Initially no ignore attribute
    expect(element.hasAttribute(IGNORE_ATTR)).toBe(false)
    expect(document.querySelectorAll(`*[${IGNORE_ATTR}]`).length).toBe(0)

    // Add ignore attribute
    element.setAttribute(IGNORE_ATTR, '')
    expect(element.hasAttribute(IGNORE_ATTR)).toBe(true)
    expect(document.querySelectorAll(`*[${IGNORE_ATTR}]`).length).toBe(1)

    // Remove ignore attribute
    element.removeAttribute(IGNORE_ATTR)
    expect(element.hasAttribute(IGNORE_ATTR)).toBe(false)
    expect(document.querySelectorAll(`*[${IGNORE_ATTR}]`).length).toBe(0)
  })
})