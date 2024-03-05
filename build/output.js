// import BANNER from './banner.js'

const paths = {
  parent: 'dist/parent/',
  child: 'dist/child/',
  jquery: 'dist/jquery/',
}

const ext = (format) =>
  format === 'es' ? 'mjs' : format === 'umd' ? 'js' : format

export const output = (file) => (format) => ({
  // banner: BANNER[file],
  file: `${paths[file]}iframe-resizer.${file}.${ext(format)}`,
  format,
  sourcemap: false,
})

export const outputs = (file) => {
  const out = output(file)
  return [out('es'), out('cjs'), out('umd')]
}
