// @vitest-environment node
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, test } from 'vitest'

// SolidStart compiles IframeResizer.tsx for the server, through the package's
// 'solid' export condition. Vite can't start a second server inside Vitest, so
// the render runs in its own process.
const RENDER = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'IframeResizer.ssr-render.mjs',
)

const styles = [undefined, 'border: 2px solid red', { 'max-width': '100%' }]

describe('Solid IframeResizer server-side rendering', () => {
  const results = JSON.parse(
    execFileSync(process.execPath, [RENDER, JSON.stringify(styles)], {
      encoding: 'utf8',
    }),
  )

  test.each([
    [0, ''],
    [1, 'border: 2px solid red'],
    [2, 'max-width:100%'],
  ])('renders style %i into the markup', (index, expected) => {
    const { error, html } = results[index]

    expect(error).toBeUndefined()
    expect(html).toContain('<iframe')
    expect(html).toContain('src="https://example.com/"')
    expect(html).toContain(`style="${expected}"`)
  })
})
