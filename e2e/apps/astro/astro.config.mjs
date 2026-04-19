import { defineConfig } from 'astro/config'

export default defineConfig({
  base: '/e2e/fixtures/astro',
  outDir: '../../fixtures/astro',
  vite: {
    resolve: {
      preserveSymlinks: true,
    },
  },
})
