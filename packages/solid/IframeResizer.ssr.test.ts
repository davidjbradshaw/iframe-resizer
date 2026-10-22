import { createComponent, renderToString } from 'solid-js/web'
import { describe, expect, test } from 'vitest'

import IframeResizer from './IframeResizer'

// Rendered in-process by the ssr vitest project, which compiles the
// component for the server as SolidStart does, with the real core and common
const renderPage = (props: Record<string, unknown> = {}): string =>
  renderToString(() =>
    createComponent(IframeResizer, {
      license: 'GPLv3',
      src: 'https://example.com/',
      id: 'ssr',
      ...props,
    }),
  )

describe('Solid IframeResizer server-side rendering', () => {
  test('renders the iframe with no style prop, and no style attribute', () => {
    const html = renderPage()

    expect(html).toContain('<iframe')
    expect(html).toContain('src="https://example.com/"')
    expect(html).not.toContain('style=')
  })

  const cases: [style: unknown, expected: string][] = [
    ['border: 2px solid red', 'border: 2px solid red'],
    [{ 'max-width': '100%' }, 'max-width:100%'],
  ]

  test.each(cases)('renders style %o into the markup', (style, expected) => {
    expect(renderPage({ style })).toContain(`style="${expected}"`)
  })
})
