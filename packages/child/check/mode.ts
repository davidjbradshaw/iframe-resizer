import { VERSION } from '../../common/consts'
import setMode, { getModeData, getModeLabel } from '../../common/mode'
import { isDef } from '../../common/utils'
import { advise, purge, vInfo } from '../console'
import settings from '../values/settings'
import state from '../values/state'

export default function ({ key, key2, mode, version }: { key: string; key2: string; mode: number; version: string }): void {
  const oMode = mode
  const pMode = setMode({ key })
  const cMode = setMode({ key2 })
  // eslint-disable-next-line no-multi-assign
  settings.mode = mode = Math.max(pMode, cMode)
  if (mode < 0) {
    mode = Math.min(pMode, cMode)
    purge()
    advise(`${getModeData(mode + 2)}${getModeData(2)}`)
    if (isDef(version)) {
      state.firstRun = false
      throw getModeData(mode + 2).replace(/<\/?[a-z][^>]*>|<\/>/gi, '')
    }
  } else if (!isDef(version) || (oMode > -1 && mode > oMode)) {
    if (sessionStorage.getItem('ifr') !== VERSION)
      vInfo(`v${VERSION} (${getModeLabel(mode)})`, mode)
    if (mode < 2) advise(getModeData(3))
    sessionStorage.setItem('ifr', VERSION)
  }
}
