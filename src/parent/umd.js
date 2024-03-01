import createIframeResize from './factory'

const iframeResize = createIframeResize()

if (typeof window !== 'undefined') {
  window.iFrameResize = iframeResize
}

export default iframeResize
