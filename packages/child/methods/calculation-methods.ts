import { checkHeightMode, checkWidthMode } from '../check/calculation-mode'
import settings from '../values/settings'

export function setHeightCalculationMethod(heightCalculationMethod: string): void {
  settings.heightCalcMode = heightCalculationMethod
  checkHeightMode()
}

export function setWidthCalculationMethod(widthCalculationMethod: string): void {
  settings.widthCalcMode = widthCalculationMethod
  checkWidthMode()
}
