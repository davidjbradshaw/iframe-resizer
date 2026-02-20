import {
  HEIGHT_CALC_MODE_DEFAULT,
  WIDTH_CALC_MODE_DEFAULT,
} from '../../common/consts'
import { warn } from '../console'

export default {
  autoResize: true,
  bodyBackground: '',
  bodyMargin: 0, // For V1 compatibility
  bodyMarginStr: '',
  bodyPadding: '',
  calculateHeight: true,
  calculateWidth: false,
  heightCalcMode: HEIGHT_CALC_MODE_DEFAULT,
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
  widthCalcMode: WIDTH_CALC_MODE_DEFAULT,

  onBeforeResize: undefined,
  onMessage: () => {
    warn('onMessage function not defined')
  },
  onReady: () => {},
}
