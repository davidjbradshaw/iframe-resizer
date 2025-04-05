import { deprecateOption } from '../console'
import settings from './settings'

const onReadyDeprecated = (messageData) => {
  if (typeof settings[messageData.id].onInit === 'function') {
    deprecateOption('init()', 'onReady()', '', messageData.id)
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
  heightCalculationMethod: 'auto',
  id: 'iFrameResizer',
  log: false,
  logExpand: false,
  license: undefined,
  mouseEvents: true,
  offsetHeight: null,
  offsetWidth: null,
  postMessageTarget: null,
  sameDomain: false,
  scrolling: false,
  sizeHeight: true,
  // sizeSelector: '',
  sizeWidth: false,
  tolerance: 0,
  waitForLoad: false,
  warningTimeout: 5000,
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
