import settings from '../values/settings'

export const sendIframeReady =
  (source: MessageEventSource | null) =>
  ({ initChild, postMessageTarget }: { initChild: () => void, postMessageTarget: MessageEventSource | null }): void => {
    if (source === postMessageTarget) initChild()
  }

export default (source: MessageEventSource | null): void =>
  Object.values(settings).forEach(sendIframeReady(source))
