// @vitest-environment node
// No window here, as in server-side rendering
import { vi } from 'vitest'

import createIframeResize from './factory'

vi.mock('@iframe-resizer/core', () => ({ default: vi.fn(() => vi.fn()) }))

describe('createIframeResize - Server-side rendering', () => {
  it('should not run in server-side rendering environment', () => {
    const iframeResize = createIframeResize()

    expect(iframeResize({}, 'iframe')).toEqual([])
  })
})
