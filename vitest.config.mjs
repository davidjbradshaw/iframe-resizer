import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { svelte } from '@sveltejs/vite-plugin-svelte'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))
const r = (p) => resolve(rootDir, p)

const alias = {
  '@iframe-resizer/common/consts': r('packages/common/consts.ts'),
  '@iframe-resizer/common': r('packages/common/index.ts'),
  '@iframe-resizer/jquery': r('packages/jquery/plugin.js'),
  '@iframe-resizer/child': r('packages/child/index.ts'),
  '@iframe-resizer/parent': r('packages/parent/factory.ts'),
  '@iframe-resizer/core': r('packages/core/index.ts'),
}

export default defineConfig({
  test: {
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
        '**/test/js/**',
        'packages/**/*.test.*',
        'packages/**/*.d.ts',
        // Exclude type-only and thin wrapper modules
        'packages/astro/index.ts',
        'packages/child/observed/observers.ts',
        'packages/child/size/index.ts',
        'packages/child/values/state.ts',
        'packages/common/index.ts',
        'packages/common/types.ts',
        'packages/core/message-data.ts',
        'packages/core/types.ts',
        'packages/core/values/page.ts',
        'packages/core/values/settings.ts',
        'packages/parent/esm.ts',
        'packages/parent/umd.ts',
        'packages/solid/index.ts',
        'packages/svelte/index.ts',
      ],
    },
    projects: [
      {
        plugins: [
          vue(),
          react(),
          svelte(),
          solid({ include: /packages\/solid\// }),
        ],
        resolve: {
          conditions: ['browser'],
          alias,
        },
        test: {
          name: 'unit',
          environment: 'jsdom',
          // Loads jsdom once per worker, not once per file. Tests then run on
          // jsdom's own window, where top, location and window can't be
          // redefined
          pool: 'vmThreads',
          setupFiles: ['./vitest.setup.js'],
          globals: true,
          include: ['packages/**/*.test.{js,ts,jsx,tsx}'],
          exclude: [
            'node_modules/**',
            'dist/**',
            'coverage/**',
            '**/.{git,svn,hg}/**',
            'e2e/**',
            'packages/**/*.ssr.test.*',
          ],
          deps: {
            optimizer: {
              web: {
                include: ['auto-console-group'],
              },
            },
          },
        },
      },
      {
        // Compiles the Solid component for the server, as SolidStart does, and
        // renders it in-process with the real modules
        plugins: [solid({ include: /packages\/solid\//, ssr: true })],
        resolve: {
          alias,
        },
        test: {
          name: 'solid-ssr',
          environment: 'node',
          globals: true,
          include: ['packages/solid/**/*.ssr.test.{js,ts,jsx,tsx}'],
        },
      },
    ],
  },
})
