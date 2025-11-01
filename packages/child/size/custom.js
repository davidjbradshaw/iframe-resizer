import { FUNCTION, HEIGHT } from '../../common/consts'
import { advise } from '../console'
import { getHeight, getWidth } from './index'

const CUSTOM = 'custom'

const deprecated = (
  calcFunc,
) => `<rb>Deprecated Option(${calcFunc}CalculationMethod)</>

The use of <b>${calcFunc}CalculationMethod</> as a function is deprecated and will be removed in a future version of <i>iframe-resizer</>. Please use the new <b>onBeforeResize</> event handler instead.

See <u>https://iframe-resizer.com/api/child</> for more details.
`

export default function setupCustomCalcMethod(calcMode, calcFunc) {
  if (typeof calcMode === FUNCTION) {
    advise(deprecated(calcFunc))

    if (calcFunc === HEIGHT) {
      getHeight.custom = calcMode
    } else {
      getWidth.custom = calcMode
    }

    calcMode = CUSTOM
  }

  return calcMode
}
