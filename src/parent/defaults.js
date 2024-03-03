import { advise } from '../common/log'
import settings from './settings'

const onReadyDeprecated = (messageData) => {
  if (typeof settings[messageData.id].onInit === 'function') {
    advise(
      messageData.id,
      `
\u001B[31;1mDeprecated Option\u001B[m

The \u001B[1monInit()\u001B[m function is deprecated and has been replaced with \u001B[1monReady()\u001B[m. It will be removed in a future version of iFrame Resizer.
      `,
    )
    settings[messageData.id].onInit(messageData)
  }
}

export default Object.freeze({
  autoResize: true,
  bodyBackground: null,
  bodyMargin: null,
  bodyPadding: null,
  checkOrigin: true,
  direction: 'vertical',
  inPageLinks: false,
  enablePublicMethods: true,
  heightCalculationMethod: 'auto',
  id: 'iFrameResizer',
  log: true,
  maxHeight: Infinity,
  maxWidth: Infinity,
  minHeight: 0,
  minWidth: 0,
  mouseEvents: true,
  offsetHeight: 0,
  offsetWidth: 0,
  postMessageTarget: null,
  sameDomain: false,
  scrolling: false,
  sizeHeight: true,
  sizeWidth: false,
  warningTimeout: 5000,
  tolerance: 0,
  widthCalculationMethod: 'auto',
  onClose: () => true,
  onClosed() {},
  onInit: false,
  onMessage: null,
  onMouseEnter() {},
  onMouseLeave() {},
  onReady: onReadyDeprecated,
  onResized() {},
  onScroll: () => true,
})
