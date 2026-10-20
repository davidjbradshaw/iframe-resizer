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

The iframe (<i>${id}</>) was removed from the page without first calling <b>disconnect()</>, so <i>iframe-resizer</> has disconnected it. Call <b>iframe.iframeResizer.disconnect()</> before removing an iframe.
`,
  )
  disconnect(iframe, id)
}

// Runs after the task that changed the page, so an iframe moved within it is
// back in the page by now and is left alone
function checkRemovals(records: MutationRecord[]): void {
  // Every insertion anywhere in the page comes through here, so nothing is
  // copied until something has actually been removed
  if (records.every(({ removedNodes }) => removedNodes.length === 0)) return

  const removed = records.flatMap(({ removedNodes }) => [...removedNodes])

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
