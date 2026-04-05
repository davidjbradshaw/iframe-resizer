/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi } from 'vitest'

describe('legacy/js/notice', () => {
  it('logs upgrade notice', async () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    await import('./notice')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
