import {
  COLLAPSE,
  EXPAND,
  LOG_COLLAPSED,
  LOG_DISABLED,
  LOG_EXPANDED,
  LOG_OPTIONS,
} from '../../common/consts'
import { hasOwn, isString } from '../../common/utils'
import { enableVInfo } from '../checks/mode'
import { error, setupConsole } from '../console'
import defaults from '../values/defaults'

export default function startLogging(id: string, options: Record<string, any>): void {
  if (options.log === LOG_DISABLED) options.log = false
  else if (options.log === LOG_COLLAPSED) options.log = COLLAPSE
  else if (options.log === LOG_EXPANDED) options.log = EXPAND

  const isLogEnabled = hasOwn(options, 'log')
  const isLogString = isString(options.log)
  const enabled = isLogEnabled
    ? isLogString
      ? true
      : options.log
    : defaults.log

  if (!hasOwn(options, 'logExpand')) {
    options.logExpand =
      isLogEnabled && isLogString ? options.log === EXPAND : defaults.logExpand
  }

  enableVInfo(options)
  setupConsole({
    enabled,
    expand: options.logExpand,
    iframeId: id,
  })

  if (isLogString && !(options.log in LOG_OPTIONS))
    error(
      id,
      `Invalid value for options.log: Accepted values are "${EXPAND}" and "${COLLAPSE}"`,
    )

  options.log = enabled
}
