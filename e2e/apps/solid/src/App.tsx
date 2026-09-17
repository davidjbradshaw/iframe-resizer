import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import IframeResizer from '@iframe-resizer/solid'
import type { IframeMessageData, IframeResizedData } from '@iframe-resizer/solid'

function App() {
  const [extra, setExtra] = createSignal<Record<string, unknown>>({})

  const updateOption = () =>
    setExtra({
      bodyBackground: 'rgb(0, 128, 0)',
      bodyPadding: '6px',
      bodyMargin: 12,
      scrolling: true,
    })

  const onResized = (data: IframeResizedData) => {
    console.log('resized', data.height, data.width)
  }

  const onMessage = (data: IframeMessageData) => {
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }

  return (
    <>
      <h2>@iframe-resizer/solid example</h2>
      <button id="update-option" onClick={updateOption}>
        Update option
      </button>
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
