import terser from '@rollup/plugin-terser';

export default [{
  input: 'src/iframeResizer.js',
  output: [{ file: 'js/iframeResizer.js' }],
  plugins: [],
}, {
  input: 'src/iframeResizer.contentWindow.js',
  output: [{ file: 'js/iframeResizer.contentWindow.js' }],
  plugins: [],
}, {
  input: 'src/iframeResizer.contentWindow.js',
  output: [{
    file: 'js/iframeResizer.contentWindow.min.js',
    sourcemap: true,
  }],
  plugins: [terser()],
}, {
  input: 'src/iframeResizer.js',
  output: [{
    file: 'js/iframeResizer.min.js',
    sourcemap: true,
  }],
  plugins: [terser()],
}]
