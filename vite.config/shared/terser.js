export default () => ({
  minify: 'terser',
  terserOptions: {
    format: {
      comments: false,
    },
  },
})
