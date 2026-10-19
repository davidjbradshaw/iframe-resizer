import { advise, event } from '../console'
import disconnect from '../methods/disconnect'
import type { IFrameComponent } from '../types'
import settings from '../values/settings'

const wasRemoved = (removed: Node[], iframe: HTMLIFrameElement): boolean =>
  removed.some((node) => node === iframe || node.contains(iframe))

function disconnectRemoved(id: string, iframe: IFrameComponent): void {
  event(id, 'iframeRemoved')
  advise(
    id,
    `<rb>Iframe removed while connected</>

The iframe (<i>${id}</>) was removed from the page without first calling <b>disconnect()</>, so <i>iframe-resizer</> has disconnected it. Call <b>iframe.iframeResizer.disconnect()</> before removing an iframe, or set the <b>disconnectOnRemove</> option to <bb>false</> if the page puts it back later.
`,
  )
  // Its methods stay, so a later close() or disconnect() from the page does
  // nothing rather than throw
  const { iframeResizer } = iframe
  disconnect(iframe)
  iframe.iframeResizer = iframeResizer
}

// Runs after the task that changed the page, so an iframe moved within it is
// back in the page by now and is left alone
function checkRemovals(records: MutationRecord[]): void {
  const removed = records.flatMap(({ removedNodes }) => [...removedNodes])
  if (removed.length === 0) return

  for (const [id, { iframe, disconnectOnRemove }] of Object.entries(settings)) {
    if (
      disconnectOnRemove &&
      iframe &&
      !iframe.isConnected &&
      wasRemoved(removed, iframe)
    )
      disconnectRemoved(id, iframe)
  }
}

export default function createIframeObserver(): void {
  new MutationObserver(checkRemovals).observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
}
