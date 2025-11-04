import { checkHeightMode, checkWidthMode } from '../check/calculation-mode'
import settings from '../values/settings'

export function setHeightCalculationMethod(heightCalculationMethod) {
  settings.heightCalcMode = heightCalculationMethod
  checkHeightMode()
}

export function setWidthCalculationMethod(widthCalculationMethod) {
  settings.widthCalcMode = widthCalculationMethod
  checkWidthMode()
}
