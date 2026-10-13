import { build } from 'vite'

import { formatBanner, injectVersion, terserMinify } from './shared/plugins.js'

export default async function () {
  await build({
    configFile: false,
    plugins: [formatBanner('parent'), ...injectVersion()],
    resolve: {
      alias: {
        '@iframe-resizer/common/consts': './packages/common/consts.ts',
        '@iframe-resizer/common': './packages/common/index.ts',
        '@iframe-resizer/core': './packages/core/index.ts',
      },
    },
    build: {
      lib: {
        entry: './packages/parent/esm.ts',
        name: 'iframeResize',
        formats: ['umd'],
        fileName: () => 'index.umd.js',
      },
      outDir: 'dist/parent',
      emptyOutDir: false,
      ...terserMinify(),
      sourcemap: process.env.BETA === '1',
    },
  })
}
