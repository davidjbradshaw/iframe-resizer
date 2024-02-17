const iframeResize = require('./js/iframeResizer')

module.exports = {
  iframeResize,
  iframeResizer: iframeResize, // Backwards compatibility
  contentWindow: require('./js/iframeResizer.contentWindow')
}
