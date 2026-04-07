import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { svelte } from '@sveltejs/vite-plugin-svelte'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))
const r = (p) => resolve(rootDir, p)

export default defineConfig({
  plugins: [vue(), react(), svelte(), solid({ include: /packages\/solid\// })],
  resolve: {
    conditions: ['browser'],
    alias: {
      '@iframe-resizer/jquery': r('packages/jquery/plugin.js'),
      '@iframe-resizer/child': r('packages/child/index.ts'),
      '@iframe-resizer/parent': r('packages/parent/factory.ts'),
      '@iframe-resizer/core': r('packages/core/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
    include: ['packages/**/*.test.{js,ts,jsx,tsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '**/.{git,svn,hg}/**',
      'e2e/**',
    ],
    deps: {
      optimizer: {
        web: {
          include: ['auto-console-group'],
        },
      },
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['packages/**/*.{js,jsx,ts,tsx,vue,svelte}'],
      exclude: [
        'coverage/**',
        'node_modules/**',
        'js-dist/**',
        '**/*.cjs',
        '**/example/**',
        '**/example-test/**',
        '**/spec/**',
        '**/test-js/**',
        'packages/**/*.test.*',
        'packages/**/*.d.ts',
        // Exclude type-only and thin wrapper modules
        'packages/astro/index.ts',
        'packages/child/observed/observers.ts',
        'packages/child/size/index.ts',
        'packages/child/values/state.ts',
        'packages/core/types.ts',
        'packages/core/values/page.ts',
        'packages/core/values/settings.ts',
        'packages/legacy/index.esm.js',
        'packages/legacy/js/iframeResizer.js',
        'packages/legacy/js/iframeResizer.contentWindow.js',
        'packages/parent/esm.ts',
        'packages/solid/index.ts',
        'packages/svelte/index.js',
      ],
    },
  },
})
