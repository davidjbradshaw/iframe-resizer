import { FUNCTION, HEIGHT } from '../../common/consts'
import { advise } from '../console'
import { getHeight, getWidth } from './index'

const CUSTOM = 'custom'

const deprecated = (
  calcFunc: string,
): string => `<rb>Deprecated Option(${calcFunc}CalculationMethod)</>

The use of <b>${calcFunc}CalculationMethod</> as a function is deprecated and will be removed in a future version of <i>iframe-resizer</>. Please use the new <b>onBeforeResize</> event handler instead.

See <u>https://iframe-resizer.com/api/child</> for more details.
`

export default function setupCustomCalcMethod(calcMode: any, calcFunc: string): any {
  if (typeof calcMode !== FUNCTION) return calcMode

  advise(deprecated(calcFunc))

  if (calcFunc === HEIGHT) {
    getHeight.custom = calcMode
  } else {
    getWidth.custom = calcMode
  }

  return CUSTOM
}
