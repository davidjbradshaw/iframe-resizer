// eslint-disable-next-line import/no-extraneous-dependencies
import terser from '@rollup/plugin-terser'

import createBanner from './banner.js'

export const output = (file) => (format) => ({
  banner: createBanner(file, format),
  file: `dist/${file}/index.${format}.js`,
  generatedCode: 'es2015',
  format,
  // plugins: terser({
  //   output: {
  //     comments: false,
  //     preamble: createBanner(file, format),
  //   },
  // }),
  sourcemap: false,
})

export const outputs = (file) => {
  const out = output(file)
  return [out('esm'), out('cjs'), out('umd')]
}
