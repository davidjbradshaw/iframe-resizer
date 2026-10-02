import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { build } from 'vite'

import { terserWithBanner } from './shared/plugins.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function vuePostBuild() {
  const root = join(__dirname, '..')

  // Build UMD separately (only vue is external, everything else bundled in)
  await build({
    configFile: false,
    plugins: [vue()],
    resolve: {
      alias: {
        '@iframe-resizer/common/consts': './packages/common/consts.ts',
        '@iframe-resizer/common': './packages/common/index.ts',
        '@iframe-resizer/core': './packages/core/index.ts',
      },
    },
    build: {
      lib: {
        entry: './packages/vue/index.ts',
        name: 'IframeResizer',
        formats: ['umd'],
        fileName: () => 'index.umd.js',
      },
      outDir: 'dist/vue',
      emptyOutDir: false,
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: { vue: 'Vue' },
        },
      },
      ...terserWithBanner('vue'),
      sourcemap: process.env.BETA || false,
    },
  })

  try {
    // Copy SFC file
    const sfcSource = join(root, 'packages/vue/iframe-resizer.vue')
    const sfcDest = join(root, 'dist/vue/iframe-resizer.vue')

    if (!existsSync(sfcSource)) {
      throw new Error(`Source file not found: ${sfcSource}`)
    }

    copyFileSync(sfcSource, sfcDest)

    // Fix import paths in generated JS files
    const files = ['index.umd.js', 'index.esm.js', 'index.cjs.js']
    for (const file of files) {
      const filePath = join(root, 'dist/vue', file)

      if (!existsSync(filePath)) {
        throw new Error(
          `Generated file not found: ${filePath}. Make sure the build completed successfully.`,
        )
      }

      const content = readFileSync(filePath, 'utf8')
      const fixed = content.replace(/packages\/vue/g, '.')
      writeFileSync(filePath, fixed)
    }
  } catch (error) {
    // Re-throw with context if this is a system error without clear context
    // Common system error codes: ENOENT, EACCES, ENOSPC, EROFS, etc.
    if (
      error.code &&
      typeof error.code === 'string' &&
      !error.message.includes('not found')
    ) {
      throw new Error(
        `Vue post-build failed with ${error.code}: ${error.message}`,
      )
    }
    throw error
  }
}
