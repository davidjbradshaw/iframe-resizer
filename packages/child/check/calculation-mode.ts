import { HIGHLIGHT } from 'auto-console-group'

import { AUTO } from '../../common/consts'
import { advise, log } from '../console'
import { getHeight, getWidth } from '../size'
import settings from '../values/settings'

export function checkCalcMode(calcMode: string, modes: any): string {
  const { label } = modes

  if (calcMode && calcMode !== AUTO) {
    advise(
      `<rb>Ignored ${label}CalculationMethod (${calcMode})</>

This version of <i>iframe-resizer</> auto detects the most suitable ${label} calculation method. The <b>${label}CalculationMethod</> option is no longer supported and has been ignored.

To remove this warning, delete the <b>${label}CalculationMethod</> option from your parent page config and/or <i>window.iframeResizer</> on the child page.
`,
    )
  }

  log(`Set ${label} calculation method: %c${AUTO}`, HIGHLIGHT)
  return AUTO
}

export function checkHeightMode(): void {
  settings.heightCalcMode = checkCalcMode(settings.heightCalcMode, getHeight)
}

export function checkWidthMode(): void {
  settings.widthCalcMode = checkCalcMode(settings.widthCalcMode, getWidth)
}
