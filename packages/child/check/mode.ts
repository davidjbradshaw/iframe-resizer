import {
  getModeData,
  getModeLabel,
  isDef,
  setMode,
  VERSION,
} from '@iframe-resizer/common'

import { advise, adviseNow, purge, vInfo } from '../console'
import settings from '../values/settings'
import state from '../values/state'

export function showVersion(
  mode: number,
  oMode: number,
  version?: string,
): void {
  if (!isDef(version) || (oMode > -1 && mode > oMode)) {
    vInfo(`v${VERSION} (${getModeLabel(mode)})`, mode)
    if (mode === 0) adviseNow(getModeData(3))
  }
}

export default function ({
  key,
  key2,
  mode,
  version,
}: {
  key?: string
  key2?: string
  mode: number
  version?: string
}): void {
  const oMode = mode
  const pMode = isDef(key) ? setMode({ key }) : -1
  const cMode = isDef(key2) ? setMode({ key: key2 }) : -1
  let modeData

  mode = Math.max(pMode, cMode)

  switch (mode) {
    case -2:
    case -1:
      purge()
      modeData = `${getModeData(Math.min(pMode, cMode) + 2)}${getModeData(2)}`
      state.firstRun = false
      break

    case 1:
    case 2:
    case 3:
      modeData = getModeData(6)
      break

    case 4:
      modeData = getModeData(7)
      break

    case 5:
      modeData = getModeData(8)
      break

    default:
      break
  }

  if (mode >= 0) showVersion(mode, oMode, version)

  if (!isDef(version) || !state.firstRun) {
    if (modeData) advise(modeData)
    if (mode < 0) {
      advise(getModeData(9))
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw modeData.split('<br>')[0].replace(/<\/?[a-z][^>]*>|<\/>/gi, '')
    }
  }

  settings.mode = mode
}
