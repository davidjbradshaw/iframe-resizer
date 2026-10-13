// Checks the published types as a user sees them: copies the built packages
// into a scratch project and compiles test-types/consumer.ts against them,
// strictly and without skipLibCheck, under each module resolution.
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

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

// Third-party packages the published types import
const DEPENDENCIES = [
  '@angular/core',
  '@types/react',
  '@vue',
  'auto-console-group',
  'csstype',
  'react',
  'rxjs',
  'solid-js',
  'svelte',
  'tslib',
  'vue',
]

const RESOLUTIONS = [
  { module: 'nodenext', moduleResolution: 'nodenext' },
  { module: 'esnext', moduleResolution: 'bundler' },
]

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

  for (const resolution of RESOLUTIONS) {
    console.log(`Checking published types (${resolution.moduleResolution})`)

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
} finally {
  rmSync(project, { recursive: true, force: true })
}
