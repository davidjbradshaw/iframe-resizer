import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import * as consoleMod from '../console'
import checkBlockingCSS from './blocking-css'

vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn() }))

describe('child/check/blocking-css', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.head.innerHTML = ''
  })

  afterEach(() => {
    document.head.innerHTML = ''
  })

  test('warns when stylesheet sets blocking CSS', () => {
    const style = document.createElement('style')
    style.textContent = 'html { min-width: 100px }'
    document.head.append(style)

    checkBlockingCSS()

    expect(consoleMod.advise).toHaveBeenCalled()
  })

  test('does not warn when no blocking CSS is present', () => {
    checkBlockingCSS()

    expect(consoleMod.advise).not.toHaveBeenCalled()
  })

  test('warns when inline style sets blocking CSS', () => {
    document.documentElement.style.minWidth = '200px'

    checkBlockingCSS()

    expect(consoleMod.advise).toHaveBeenCalledWith(
      expect.stringContaining('min-width'),
    )
    expect(consoleMod.advise).toHaveBeenCalledWith(
      expect.stringContaining('inline style'),
    )

    document.documentElement.style.minWidth = ''
  })

  test('warns for max-height on body element', () => {
    const style = document.createElement('style')
    style.textContent = 'body { max-height: 500px }'
    document.head.append(style)

    checkBlockingCSS()

    expect(consoleMod.advise).toHaveBeenCalledWith(
      expect.stringContaining('max-height'),
    )
  })

  test('warns for max-width CSS property', () => {
    const style = document.createElement('style')
    style.textContent = 'html { max-width: 800px }'
    document.head.append(style)

    checkBlockingCSS()

    expect(consoleMod.advise).toHaveBeenCalledWith(
      expect.stringContaining('max-width'),
    )
  })

  test('warns for min-height CSS property', () => {
    const style = document.createElement('style')
    style.textContent = 'body { min-height: 300px }'
    document.head.append(style)

    checkBlockingCSS()

    expect(consoleMod.advise).toHaveBeenCalledWith(
      expect.stringContaining('min-height'),
    )
  })

  test('handles cross-origin stylesheet errors gracefully', () => {
    // Create a mock stylesheet that will throw an error when accessing cssRules
    const mockStyleSheet = {
      cssRules: null,
      href: 'https://external.com/style.css',
    }

    Object.defineProperty(mockStyleSheet, 'cssRules', {
      get() {
        throw new Error('SecurityError: Cannot access cross-origin stylesheet')
      },
    })

    const originalStyleSheets = document.styleSheets
    Object.defineProperty(document, 'styleSheets', {
      value: [mockStyleSheet],
      configurable: true,
    })

    // Set computed style to return a blocking value
    const originalGetComputedStyle = window.getComputedStyle
    window.getComputedStyle = () => ({
      getPropertyValue: () => '100px',
    })

    document.documentElement.style.minWidth = '100px'

    checkBlockingCSS()

    expect(consoleMod.log).toHaveBeenCalledWith(
      expect.stringContaining('Unable to access stylesheet'),
      'https://external.com/style.css',
    )

    // Clean up
    Object.defineProperty(document, 'styleSheets', {
      value: originalStyleSheets,
      configurable: true,
    })
    window.getComputedStyle = originalGetComputedStyle
    document.documentElement.style.minWidth = ''
  })

  test('only logs cross-origin error once per stylesheet', () => {
    const mockStyleSheet = {
      cssRules: null,
      href: 'https://external.com/repeated.css',
    }

    Object.defineProperty(mockStyleSheet, 'cssRules', {
      get() {
        throw new Error('SecurityError')
      },
    })

    const originalStyleSheets = document.styleSheets
    Object.defineProperty(document, 'styleSheets', {
      value: [mockStyleSheet],
      configurable: true,
    })

    const originalGetComputedStyle = window.getComputedStyle
    window.getComputedStyle = () => ({
      getPropertyValue: () => '100px',
    })

    document.documentElement.style.minWidth = '100px'

    // Call twice to verify it only logs once
    checkBlockingCSS()
    const firstCallCount = consoleMod.log.mock.calls.filter((call) =>
      call[0]?.includes('Unable to access stylesheet'),
    ).length

    vi.clearAllMocks()
    checkBlockingCSS()
    const secondCallCount = consoleMod.log.mock.calls.filter((call) =>
      call[0]?.includes('Unable to access stylesheet'),
    ).length

    expect(firstCallCount).toBe(1)
    expect(secondCallCount).toBe(0)

    // Clean up
    Object.defineProperty(document, 'styleSheets', {
      value: originalStyleSheets,
      configurable: true,
    })
    window.getComputedStyle = originalGetComputedStyle
    document.documentElement.style.minWidth = ''
  })
})
