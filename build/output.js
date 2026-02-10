// eslint-disable-next-line import/no-extraneous-dependencies
import terser from '@rollup/plugin-terser'

import createBanner from './banner.js'

const { BETA } = process.env

export const output = (file) => (format) => {
  const settings = {
    banner: createBanner(file, format),
    file: `dist/${file}/index.${format}.js`,
    generatedCode: 'es2015',
    format,
    sourcemap: false,
  }

  if (
    format === 'umd' ||
    format === 'iife' ||
    file === 'core' ||
    file === 'child'
  ) {
    settings.plugins = terser({
      output: {
        comments: false,
        preamble: createBanner(file, format),
      },
    })
    settings.sourcemap = BETA || false
  }

  return settings
}

export const outputs = (file) => {
  const out = output(file)
  return [out('esm'), out('cjs'), out('umd')]
}
