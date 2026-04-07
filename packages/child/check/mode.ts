import { VERSION } from '../../common/consts'
import setMode, { getModeData, getModeLabel } from '../../common/mode'
import { isDef } from '../../common/utils'
import { advise, purge, vInfo } from '../console'
import settings from '../values/settings'
import state from '../values/state'

function showVersion(mode: number, oMode: number, version?: string): void {
  if (!isDef(version) || (oMode > -1 && mode > oMode)) {
    if (sessionStorage.getItem('ifr') === VERSION) return
    vInfo(`v${VERSION} (${getModeLabel(mode)})`, mode)
    if (mode < 2) advise(getModeData(3))
    sessionStorage.setItem('ifr', VERSION)
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
      showVersion(mode, oMode, version)
  }

  if (!isDef(version) || !state.firstRun) {
    if (modeData) advise(modeData)
    if (!state.firstRun)
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw modeData.split('<br>')[0].replace(/<\/?[a-z][^>]*>|<\/>/gi, '')
  }

  settings.mode = mode
}
