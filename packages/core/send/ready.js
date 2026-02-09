import settings from '../values/settings'

export const sendIframeReady =
  (source) =>
  ({ initChild, postMessageTarget }) => {
    if (source === postMessageTarget) initChild()
  }

export default (source) =>
  Object.values(settings).forEach(sendIframeReady(source))
