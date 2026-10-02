import { build } from 'vite'

import { injectVersion, terserWithBanner } from './shared/plugins.js'

export default async function () {
  await build({
    configFile: false,
    plugins: [...injectVersion()],
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
      ...terserWithBanner('core'),
      sourcemap: process.env.BETA || false,
    },
  })
}
