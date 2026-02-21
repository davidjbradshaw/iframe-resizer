import { COLLAPSE, EXPAND, LOG_OPTIONS } from '../../common/consts'
import { hasOwn, isString } from '../../common/utils'
import { enableVInfo } from '../checks/mode'
import { error, setupConsole } from '../console'
import defaults from '../values/defaults'

export default function startLogging(id: string, options: Record<string, any>): void {
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
