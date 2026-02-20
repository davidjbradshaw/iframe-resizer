import { FUNCTION, PARENT_INFO, PARENT_INFO_STOP } from '../../common/consts'
import { typeAssert } from '../../common/utils'
import { deprecateMethod } from '../console'
import sendMessage from '../send/message'
import state from '../values/state'

export function getParentProps(callback: (info: any) => void): () => void {
  typeAssert(
    callback,
    FUNCTION,
    'parentIframe.getParentProps(callback) callback',
  )

  state.onParentInfo = callback
  sendMessage(0, 0, PARENT_INFO)

  return () => {
    state.onParentInfo = null
    sendMessage(0, 0, PARENT_INFO_STOP)
  }
}

export function getParentProperties(callback: (info: any) => void): void {
  deprecateMethod('getParentProperties()', 'getParentProps()')
  getParentProps(callback)
}
