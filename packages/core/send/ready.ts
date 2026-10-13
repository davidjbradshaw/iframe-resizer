import { error, event } from '../console'
import settings from '../values/settings'
import { getOrigin } from './timeout'

// The browser drops messages to a page whose origin is not a target origin
const isAllowedOrigin = (targetOrigin: string[], origin: string): boolean =>
  targetOrigin.some((target) => target === '*' || getOrigin(target) === origin)

export const sendIframeReady =
  ({ source, origin }: Pick<MessageEvent, 'source' | 'origin'>) =>
  ([id, { initChild, postMessageTarget, targetOrigin }]: [
    string,
    {
      initChild: () => void
      postMessageTarget: MessageEventSource | null
      targetOrigin?: string[]
    },
  ]): void => {
    if (source !== postMessageTarget) return

    if (targetOrigin && !isAllowedOrigin(targetOrigin, origin)) {
      event(id, 'originNotAllowed')
      error(
        id,
        `The iframe (${id}) has loaded a page from ${origin}, which the checkOrigin option does not allow, so the browser blocks messages to it and it will not be resized. Set checkOrigin to false, or to an array of allowed origins that includes ${origin}. See https://iframe-resizer.com/checkorigin for more information.`,
      )
      return
    }

    initChild()
  }

export default (event: Pick<MessageEvent, 'source' | 'origin'>): void =>
  Object.entries(settings).forEach(sendIframeReady(event))
