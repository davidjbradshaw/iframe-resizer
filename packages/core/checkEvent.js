import { FUNCTION } from '../common/consts'
import { isolateUserCode } from '../common/utils'
import { warn } from './console'
import settings from './values/settings'

function checkEvent(iframeId, funcName, val) {
  if (!settings[iframeId]) return null

  const func = settings[iframeId][funcName]

  if (typeof func === FUNCTION)
    if (funcName === 'onBeforeClose' || funcName === 'onScroll') {
      try {
        return func(val)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        warn(iframeId, `Error in ${funcName} callback`)
      }
    } else return isolateUserCode(func, val)

  throw new TypeError(`${funcName} on iFrame[${iframeId}] is not a function`)
}

export default checkEvent
