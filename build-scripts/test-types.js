// Checks the published types as a user sees them: copies the built packages
// into a scratch project and compiles test-types/consumer.ts against them,
// strictly and without skipLibCheck, under each module resolution.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SVELTE4 = join(root, 'build-scripts/svelte4')

const PACKAGES = [
  'alpine',
  'angular',
  'astro',
  'child',
  'common',
  'core',
  'parent',
  'react',
  'solid',
  'svelte',
  'vue',
  'web-component',
]

// Third-party packages the published types import, apart from Svelte
const DEPENDENCIES = [
  '@angular/core',
  '@types/react',
  '@vue',
  'auto-console-group',
  'csstype',
  'react',
  'rxjs',
  'solid-js',
  'tslib',
  'vue',
]

// The Svelte package supports Svelte 4 and 5, so the types are checked with
// each: the repo's own Svelte 5, and Svelte 4 from build-scripts/svelte4
const SVELTE_VERSIONS = [
  { name: 'Svelte 5', path: join(root, 'node_modules/svelte') },
  { name: 'Svelte 4', path: join(SVELTE4, 'node_modules/svelte') },
]

const RESOLUTIONS = [
  { module: 'nodenext', moduleResolution: 'nodenext' },
  { module: 'esnext', moduleResolution: 'bundler' },
]

// Installs Svelte 4 on the first run, and again when its lockfile changes
function installSvelte4() {
  const hash = createHash('sha256')
    .update(readFileSync(join(SVELTE4, 'package-lock.json')))
    .digest('hex')
  const installed = join(SVELTE4, 'node_modules/.lockfile-hash')
  if (existsSync(installed) && readFileSync(installed, 'utf8') === hash) return

  execFileSync('npm', ['ci', '--prefix', SVELTE4, '--no-audit', '--no-fund'], {
    stdio: 'inherit',
  })
  writeFileSync(installed, hash)
}

installSvelte4()

const project = mkdtempSync(join(tmpdir(), 'iframe-resizer-types-'))
const modules = join(project, 'node_modules')

try {
  // Copied, not linked, so imports between our packages resolve to dist
  for (const pkg of PACKAGES) {
    cpSync(join(root, 'dist', pkg), join(modules, '@iframe-resizer', pkg), {
      recursive: true,
    })
  }

  for (const dep of DEPENDENCIES) {
    const link = join(modules, dep)
    mkdirSync(dirname(link), { recursive: true })
    symlinkSync(join(root, 'node_modules', dep), link)
  }

  cpSync(join(root, 'test-types/consumer.ts'), join(project, 'consumer.ts'))

  for (const svelte of SVELTE_VERSIONS) {
    const link = join(modules, 'svelte')
    rmSync(link, { force: true })
    symlinkSync(svelte.path, link)

    for (const resolution of RESOLUTIONS) {
      console.log(
        `Checking published types (${resolution.moduleResolution}, ${svelte.name})`,
      )

      writeFileSync(
        join(project, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            ...resolution,
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            target: 'es2022',
            lib: ['dom', 'es2022'],
            types: [],
            experimentalDecorators: true,
            jsx: 'preserve',
            jsxImportSource: 'solid-js',
          },
          files: ['consumer.ts'],
        }),
      )

      execFileSync(join(root, 'node_modules/.bin/tsc'), ['-p', project], {
        stdio: 'inherit',
      })
    }
  }
} finally {
  rmSync(project, { recursive: true, force: true })
}
