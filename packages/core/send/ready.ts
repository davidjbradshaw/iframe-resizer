import isAllowedOrigin from '../checks/allowed-origin'
import { error, event } from '../console'
import { getPostMessageTarget, refreshRemoteHost } from '../setup/target-origin'
import settings from '../values/settings'

export const sendIframeReady =
  ({ source, origin }: Pick<MessageEvent, 'source' | 'origin'>) =>
  ([id, { initChild }]: [string, { initChild: () => void }]): void => {
    if (!source || source !== getPostMessageTarget(id)) return

    // The src may have changed since the target origins were last set
    refreshRemoteHost(id)
    const { targetOrigin } = settings[id]

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
