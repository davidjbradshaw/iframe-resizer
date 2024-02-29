import { createIframeResize } from './parent'

const iframeResize = createIframeResize()

if (typeof window !== 'undefined') {
  window.iFrameResize = iframeResize
}

export default iframeResize
