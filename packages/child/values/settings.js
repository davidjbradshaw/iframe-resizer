import {
  HEIGHT_CALC_MODE_DEFAULT,
  WIDTH_CALC_MODE_DEFAULT,
} from '../../common/consts'
import { warn } from '../console'

export default {
  bodyMargin: 0, // For V1 compatibility
  calculateWidth: false,
  logging: false,
  autoResize: true,
  bodyMarginStr: '',
  heightCalcMode: HEIGHT_CALC_MODE_DEFAULT,
  bodyBackground: '',
  bodyPadding: '',
  tolerance: 0,
  inPageLinks: false,
  widthCalcMode: WIDTH_CALC_MODE_DEFAULT,
  mouseEvents: false,
  offsetHeight: 0,
  offsetWidth: 0,
  calculateHeight: true,
  mode: 0,
  logExpand: false,
  ignoreSelector: '',
  sizeSelector: '',
  targetOrigin: '*',
  onBeforeResize: undefined,
  onMessage: () => {
    warn('onMessage function not defined')
  },
  onReady: () => {},
}
