import { build } from 'vite'

import { formatBanner, injectVersion, terserMinify } from './shared/plugins.js'

export default async function () {
  await build({
    configFile: false,
    plugins: [formatBanner('core'), ...injectVersion()],
    resolve: {
      alias: {
        '@iframe-resizer/common/consts': './packages/common/consts.ts',
        '@iframe-resizer/common': './packages/common/index.ts',
      },
    },
    build: {
      lib: {
        entry: './packages/core/index.ts',
        name: 'connectResizer',
        formats: ['umd'],
        fileName: () => 'index.umd.js',
      },
      outDir: 'dist/core',
      emptyOutDir: false,
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
      ...terserMinify(),
      sourcemap: process.env.BETA === '1',
    },
  })
}
