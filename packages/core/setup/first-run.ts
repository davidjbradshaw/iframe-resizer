import checkMode from '../checks/mode'
import { log } from '../console'
import settings from '../values/settings'

export default function firstRun(id: string, mode: string | undefined): void {
  if (!settings[id]) return

  log(id, `First run for ${id}`)
  checkMode(id, mode)
  settings[id].firstRun = false
}
