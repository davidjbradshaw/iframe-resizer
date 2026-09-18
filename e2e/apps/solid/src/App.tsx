import { createSignal, For } from 'solid-js'
import { render } from 'solid-js/web'
import IframeResizer from '@iframe-resizer/solid'
import type { IframeMessageData, IframeResizedData } from '@iframe-resizer/solid'

// Option changes applied after init by the e2e tests, one button per step
const UPDATES: Record<string, Record<string, unknown>> = {
  styles: {
    bodyBackground: 'rgb(0, 128, 0)',
    bodyPadding: '6px',
    bodyMargin: 12,
    scrolling: true,
    checkOrigin: [location.origin],
  },
  offset: { offsetSize: 100 },
  tolerance: { tolerance: 1000 },
  links: { inPageLinks: false },
}

function App() {
  const [extra, setExtra] = createSignal<Record<string, unknown>>({})

  const update = (step: string) =>
    setExtra((prev) => ({ ...prev, ...UPDATES[step] }))

  const onResized = (data: IframeResizedData) => {
    console.log('resized', data.height, data.width)
  }

  const onMessage = (data: IframeMessageData) => {
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
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
        onResized={onResized}
        src="child/frame.test.html"
        style={{ width: '100%', height: '100vh' }}
      />
    </>
  )
}

render(() => <App />, document.getElementById('root')!)
