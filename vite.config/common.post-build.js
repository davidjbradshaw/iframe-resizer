import { build } from 'vite'

import { injectVersion, terserWithBanner } from './shared/plugins.js'

export default async function () {
  await build({
    configFile: false,
    plugins: [...injectVersion()],
    build: {
      lib: {
        entry: './packages/common/consts.ts',
        formats: ['es', 'cjs'],
        fileName: (format) => `consts.${format === 'es' ? 'esm' : 'cjs'}.js`,
      },
      outDir: 'dist/common',
      emptyOutDir: false,
      ...terserWithBanner('common'),
      sourcemap: process.env.BETA || false,
    },
  })
}
