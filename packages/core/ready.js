import { INIT_FROM_IFRAME } from '../common/consts'
import createOutgoingMessage from './outgoing'
import warnOnNoResponse from './timeout'
import trigger from './trigger'
import settings from './values/settings'

export const sendInit = (source) => (iframeId) => {
  const { ready, postMessageTarget } = settings[iframeId]

  if (ready || source !== postMessageTarget) return

  trigger(INIT_FROM_IFRAME, createOutgoingMessage(iframeId), iframeId)
  warnOnNoResponse(iframeId, settings)
}

export default (source) => Object.keys(settings).forEach(sendInit(source))
