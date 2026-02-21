import { VERSION } from '../../common/consts'
import { getModeData, getModeLabel } from '../../common/mode'
import { advise, purge as consoleClear, vInfo } from '../console'
import settings from '../values/settings'

let vAdvised = false
let vInfoDisable = false

export default function checkMode(id: string, childMode: number = -3): void {
  if (vAdvised) return
  const mode = Math.max(settings[id].mode, childMode)
  if (mode > settings[id].mode) settings[id].mode = mode
  if (mode < 0) {
    consoleClear(id)
    if (!settings[id].vAdvised)
      advise(id || 'Parent', `${getModeData(mode + 2)}${getModeData(2)}`)
    settings[id].vAdvised = true
    throw getModeData(mode + 2).replace(/<\/?[a-z][^>]*>|<\/>/gi, '')
  }
  if (!(mode > 0 && vInfoDisable)) {
    vInfo(`v${VERSION} (${getModeLabel(mode)})`, mode)
  }
  if (mode < 1) advise('Parent', getModeData(3))
  vAdvised = true
}

export function preModeCheck(id: string): void {
  if (vAdvised) return
  const { mode } = settings[id]
  if (mode !== -1) checkMode(id, mode)
}

export function enableVInfo(options: Record<string, any>): void {
  if (options?.log === -1) {
    options.log = false
    vInfoDisable = true
  }
}
