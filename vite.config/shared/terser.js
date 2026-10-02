import createBanner from './banner.js'

export default (file) => ({
  minify: 'terser',
  terserOptions: {
    format: {
      comments: false,
      preamble: createBanner(file, 'esm'),
    },
  },
})
