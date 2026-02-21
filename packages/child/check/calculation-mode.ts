import { HIGHLIGHT } from 'auto-console-group'

import {
  AUTO,
  HEIGHT_CALC_MODE_DEFAULT,
  WIDTH_CALC_MODE_DEFAULT,
} from '../../common/consts'
import { advise, log, warn } from '../console'
import { getHeight, getWidth } from '../size'
import settings from '../values/settings'

const DEPRECATED_RESIZE_METHODS = {
  bodyOffset: 1,
  bodyScroll: 1,
  offset: 1,
  documentElementOffset: 1,
  documentElementScroll: 1,
  boundingClientRect: 1,
  max: 1,
  min: 1,
  grow: 1,
  lowestElement: 1,
}

const olderVersions = (
  label: string,
): string => `set this option to <b>'auto'</> when using an older version of <i>iframe-resizer</> on the parent page. This can be done on the child page by adding the following code:

window.iframeResizer = {
license: 'xxxx',
${label}CalculationMethod: '${AUTO}',
}
`

function showDeprecationWarning(label: string, calcMode: string): void {
  const actionMsg = settings.version
    ? 'remove this option.'
    : olderVersions(label)

  advise(
    `<rb>Deprecated ${label}CalculationMethod (${calcMode})</>

This version of <i>iframe-resizer</> can auto detect the most suitable ${label} calculation method. It is recommended that you ${actionMsg}
`,
  )
}

export function checkCalcMode(calcMode: string, calcModeDefault: string, modes: any): string {
  const { label } = modes

  if (calcModeDefault !== calcMode) {
    if (!(calcMode in modes)) {
      warn(`${calcMode} is not a valid option for ${label}CalculationMethod.`)
      calcMode = calcModeDefault
    }

    if (calcMode in DEPRECATED_RESIZE_METHODS)
      showDeprecationWarning(label, calcMode)
  }

  log(`Set ${label} calculation method: %c${calcMode}`, HIGHLIGHT)
  return calcMode
}

export function checkHeightMode(): void {
  settings.heightCalcMode = checkCalcMode(
    settings.heightCalcMode,
    HEIGHT_CALC_MODE_DEFAULT,
    getHeight,
  )
}

export function checkWidthMode(): void {
  settings.widthCalcMode = checkCalcMode(
    settings.widthCalcMode,
    WIDTH_CALC_MODE_DEFAULT,
    getWidth,
  )
}
