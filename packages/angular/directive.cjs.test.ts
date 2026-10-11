import { type NgZone } from '@angular/core'
import { describe, expect, test, vi } from 'vitest'

// A test runner such as Vitest leaves the published .mjs to Node, which loads
// core's CommonJS build, so the default import is the whole module.exports
const { connectResizer } = vi.hoisted(() => ({
  connectResizer: vi.fn(() => (iframe: any) => {
    iframe.iframeResizer = {}
    return iframe.iframeResizer
  }),
}))

vi.mock('@iframe-resizer/core', () => ({
  default: { __esModule: true, default: connectResizer },
}))

vi.mock('auto-console-group', () => ({
  default: () => ({
    event: vi.fn(),
    expand: vi.fn(),
    label: vi.fn(),
    log: vi.fn(),
  }),
}))

const { IframeResizerDirective } = await import('./directive')

describe('Angular IframeResizerDirective with core loaded as CommonJS', () => {
  test('connects to the iframe', () => {
    const iframe = document.createElement('iframe')
    const zone = {
      run: (fn: () => unknown) => fn(),
      runOutsideAngular: (fn: () => unknown) => fn(),
    }
    const directive = new IframeResizerDirective(
      { nativeElement: iframe },
      zone as unknown as NgZone,
    )

    directive.ngAfterViewInit()

    expect(connectResizer).toHaveBeenCalled()
    expect(directive.iframeResizer).toBe((iframe as any).iframeResizer)
  })
})
