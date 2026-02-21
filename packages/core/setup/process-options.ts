import setMode from '../../common/mode'
import { hasOwn } from '../../common/utils'
import checkOptions from '../checks/options'
import checkWarningTimeout from '../checks/warning-timeout'
import { checkTitle } from '../page/title'
import setOffsetSize from '../send/offset'
import defaults from '../values/defaults'
import settings from '../values/settings'
import setDirection from './direction'
import { getPostMessageTarget, setTargetOrigin } from './target-origin'
import updateOptionNames from './update-option-names'

const hasMouseEvents = (options: Record<string, any>): boolean =>
  hasOwn(options, 'onMouseEnter') || hasOwn(options, 'onMouseLeave')

export default function processOptions(iframe: HTMLIFrameElement, options: Record<string, any>): void {
  const { id } = iframe
  settings[id] = {
    ...settings[id],
    iframe,
    remoteHost: iframe?.src.split('/').slice(0, 3).join('/'),
    ...defaults,
    ...checkOptions(id, options),
    mouseEvents: hasMouseEvents(options),
    mode: setMode(options),
    syncTitle: checkTitle(id),
  }

  updateOptionNames(id)
  setDirection(id)
  setOffsetSize(id, options)
  checkWarningTimeout(id)
  getPostMessageTarget(iframe)
  setTargetOrigin(id)
}
