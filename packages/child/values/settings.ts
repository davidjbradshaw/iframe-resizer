import { AUTO } from '../../common/consts'
import { warn } from '../console'

export default {
  autoResize: true,
  bodyBackground: '',
  bodyMargin: 0, // For V1 compatibility
  bodyMarginStr: '',
  bodyPadding: '',
  calculateHeight: true,
  calculateWidth: false,
  heightCalcMode: AUTO,
  ignoreSelector: '',
  inPageLinks: false,
  logging: false,
  logExpand: false,
  mode: 0,
  mouseEvents: false,
  offsetHeight: 0,
  offsetWidth: 0,
  sizeSelector: '',
  targetOrigin: '*',
  tolerance: 0,
  widthCalcMode: AUTO,

  onBeforeResize: undefined,
  onMessage: () => {
    warn('onMessage function not defined')
  },
  onReady: () => {},
}
