import { VERTICAL } from '../../common/consts'
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
  direction: VERTICAL,
  inPageLinks: false,
  heightCalculationMethod: 'auto',
  id: 'iFrameResizer', // TODO: v6 change to 'iframeResizer'
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
  onBeforeClose: () => true,
  onAfterClose() {},
  onInit: false,
  onMessage: null,
  onMouseEnter() {},
  onMouseLeave() {},
  onReady: onReadyDeprecated,
  onResized() {},
  onScroll: () => true,
})
