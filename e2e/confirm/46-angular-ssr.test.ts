// Finding 46: the Angular directive calls connectResizer() from ngAfterViewInit,
// which Angular also runs during server-side rendering, where `window` is not defined.
//
// Renders a component using the directive with @angular/platform-server (Angular 19,
// same version as e2e/apps/angular) in a child Node process. The project is in
// ./angular-ssr and takes @iframe-resizer/* from dist/. The directive is a copy of
// packages/angular/directive.ts, compiled with tsc for JIT.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SSR_DIR = join(dirname(fileURLToPath(import.meta.url)), 'angular-ssr')
const ROOT = join(SSR_DIR, '..', '..', '..')

function renderOnServer() {
  if (!existsSync(join(SSR_DIR, 'node_modules/@angular/platform-server'))) {
    execFileSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: SSR_DIR })
  }

  // Refresh the copied dist packages and the directive, then compile and render
  execFileSync('bash', ['setup-dist.sh'], { cwd: SSR_DIR })
  execFileSync('cp', [
    join(ROOT, 'packages/angular/directive.ts'),
    join(SSR_DIR, 'src/directive.ts'),
  ])
  try {
    // tsc reports type errors against the dist d.ts files, but still emits
    execFileSync('npx', ['tsc', '-p', 'tsconfig.json'], { cwd: SSR_DIR })
  } catch {
    /* emit happened anyway */
  }

  const output = execFileSync('node', ['out/render.js'], {
    cwd: SSR_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const line = output.split('\n').find((l) => l.startsWith('RESULT '))
  if (!line) throw new Error(`No RESULT line in output:\n${output}`)
  return JSON.parse(line.slice('RESULT '.length)) as {
    errors: string[]
    renderError?: string
    html: string
  }
}

describe('Angular directive under server-side rendering', () => {
  it('renders the iframe on the server without throwing', () => {
    const result = renderOnServer()

    expect(result.renderError).toBeUndefined()
    expect(result.html).toContain('<iframe id="frame"')
    // The directive must not start the resizer on the server
    expect(result.errors).toEqual([])
  })
})
