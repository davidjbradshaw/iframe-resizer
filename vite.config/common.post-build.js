import { build } from 'vite'

import { formatBanner, injectVersion, terserMinify } from './shared/plugins.js'

export default async function () {
  await build({
    configFile: false,
    plugins: [formatBanner('common'), ...injectVersion()],
    build: {
      lib: {
        entry: './packages/common/consts.ts',
        formats: ['es', 'cjs'],
        fileName: (format) => `consts.${format === 'es' ? 'esm' : 'cjs'}.js`,
      },
      outDir: 'dist/common',
      emptyOutDir: false,
      ...terserMinify(),
      sourcemap: process.env.BETA === '1',
    },
  })
}
