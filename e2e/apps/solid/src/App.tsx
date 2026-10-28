import { createSignal, For } from 'solid-js'
import { render } from 'solid-js/web'
import IframeResizer from '@iframe-resizer/solid'
import type { IframeMessageData, IframeResizedData } from '@iframe-resizer/solid'
import { record, updates } from '../../../shared/app'

// Option changes applied after init by the e2e tests, one button per step
const UPDATES: Record<string, Record<string, unknown>> = updates(location.origin)

function App() {
  const [extra, setExtra] = createSignal<Record<string, unknown>>({})

  const update = (step: string) =>
    setExtra((prev) => ({ ...prev, ...UPDATES[step] }))

  const onReady = () => record('onReady')

  const onResized = (data: IframeResizedData) => {
    record('onResized', { type: data.type })
  }

  const onMessage = (data: IframeMessageData) => {
    record('onMessage', { message: data.message })
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }

  const onScroll = () => {
    record('onScroll')
    return true
  }

  return (
    <>
      <h2>@iframe-resizer/solid example</h2>
      <For each={Object.keys(UPDATES)}>
        {(step) => (
          <button id={`update-${step}`} onClick={() => update(step)}>
            Update {step}
          </button>
        )}
      </For>
      <IframeResizer
        license="GPLv3"
        id="myIframe"
        log
        inPageLinks
        {...extra()}
        onMessage={onMessage}
        onReady={onReady}
        onResized={onResized}
        onScroll={onScroll}
        src="child/frame.test.html"
        style={{ width: '100%', height: '100vh' }}
      />
    </>
  )
}

render(() => <App />, document.getElementById('root')!)
