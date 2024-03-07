import createBanner from './banner.js'

export const output = (file) => (format) => ({
  banner: createBanner(file, format),
  file: `dist/${file}/iframe-resizer.${file}.${format}.js`,
  format,
  sourcemap: false,
})

export const outputs = (file) => {
  const out = output(file)
  return [out('esm'), out('cjs'), out('umd')]
}
