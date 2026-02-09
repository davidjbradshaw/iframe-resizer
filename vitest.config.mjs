import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
    deps: {
      inline: ['auto-console-group'],
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reports: ['text', 'html', 'lcov'],
      exclude: [
        'coverage/**',
        'node_modules/**',
        'js-dist/**',
        '**/*.cjs',
        '**/example/**',
        '**/example-test/**',
        '**/test-js/**',
      ],
    },
  },
})
