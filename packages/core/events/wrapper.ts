import { FUNCTION } from '../../common/consts'
import { isolateUserCode } from '../../common/utils'
import { warn } from '../console'
import settings from '../values/settings'

function on(iframeId: string, funcName: string, val: any): any {
  if (!settings[iframeId]) return null

  const func = settings[iframeId][funcName]

  if (typeof func !== FUNCTION)
    throw new TypeError(`${funcName} on iframe[${iframeId}] is not a function`)

  if (funcName !== 'onBeforeClose' && funcName !== 'onScroll')
    return isolateUserCode(func, val)

  try {
    return func(val)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    warn(iframeId, `Error in ${funcName} callback`)
    return null
  }
}

export default on
