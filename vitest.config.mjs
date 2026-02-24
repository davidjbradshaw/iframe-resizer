import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { svelte } from '@sveltejs/vite-plugin-svelte'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))
const r = (p) => resolve(rootDir, p)

export default defineConfig({
  plugins: [vue(), react(), svelte()],
  resolve: {
    conditions: ['browser'],
    alias: {
      '@iframe-resizer/jquery': r('packages/jquery/plugin.js'),
      '@iframe-resizer/child': r('packages/child/index.js'),
      '@iframe-resizer/parent': r('packages/parent/factory.js'),
      '@iframe-resizer/core': r('packages/core/index.js'),
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
        // Exclude thin wrapper modules that contain no executable statements
        'packages/child/observed/observers.js',
        'packages/child/size/index.js',
        'packages/child/values/state.js',
        'packages/core/values/page.js',
        'packages/core/values/settings.js',
        'packages/legacy/index.esm.js',
        'packages/legacy/js/iframeResizer.js',
        'packages/legacy/js/iframeResizer.contentWindow.js',
        'packages/parent/esm.js',
      ],
    },
  },
})
