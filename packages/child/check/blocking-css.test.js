import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn() }))
import * as consoleMod from '../console'
import checkBlockingCSS from './blocking-css'

describe('child/check/blocking-css', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.head.innerHTML = ''
    // add a style rule that matches html element
    const style = document.createElement('style')
    style.textContent = 'html { min-width: 100px }'
    document.head.appendChild(style)
  })

  test('warns when stylesheet sets blocking CSS', () => {
    checkBlockingCSS()
    expect(consoleMod.advise).toHaveBeenCalled()
  })
})
