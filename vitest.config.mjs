import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [vue(), react()],
  resolve: {
    alias: {
      '@iframe-resizer/jquery': '/Users/davidbradshaw/dev/iframe-resizer/mono/packages/jquery/plugin.js',
      '@iframe-resizer/child': '/Users/davidbradshaw/dev/iframe-resizer/mono/packages/child/index.js',
      '@iframe-resizer/parent': '/Users/davidbradshaw/dev/iframe-resizer/mono/packages/parent/factory.js',
      '@iframe-resizer/core': '/Users/davidbradshaw/dev/iframe-resizer/mono/packages/core/index.js',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
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
      reports: ['text', 'html', 'lcov'],
      include: ['packages/**/*.{js,jsx,vue}'],
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
