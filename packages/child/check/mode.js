import { VERSION } from '../../common/consts'
import setMode, { getModeData, getModeLabel } from '../../common/mode'
import { isDef } from '../../common/utils'
import { advise, log, purge, vInfo } from '../console'
import settings from '../values/settings'

export default function ({ key, key2, mode, version }) {
  const oMode = mode
  const pMode = setMode({ key })
  const cMode = setMode({ key2 })
  // eslint-disable-next-line no-multi-assign
  settings.mode = mode = Math.max(pMode, cMode)
  log('Final mode set to:', getModeLabel(mode))
  if (mode < 0) {
    mode = Math.min(pMode, cMode)
    purge()
    advise(`${getModeData(mode + 2)}${getModeData(2)}`)
    if (isDef(version))
      throw getModeData(mode + 2).replace(/<\/?[a-z][^>]*>|<\/>/gi, '')
  } else if (!isDef(version) || (oMode > -1 && mode > oMode)) {
    if (sessionStorage.getItem('ifr') !== VERSION)
      vInfo(`v${VERSION} (${getModeLabel(mode)})`, mode)
    if (mode < 2) advise(getModeData(3))
    sessionStorage.setItem('ifr', VERSION)
  }
}
