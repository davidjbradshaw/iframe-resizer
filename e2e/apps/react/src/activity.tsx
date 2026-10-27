import { Activity, useState } from 'react'
import ReactDOM from 'react-dom/client'
import IframeResizer from '@iframe-resizer/react'

// ?origin= serves the child from another origin, to test the postMessage route
const origin = new URLSearchParams(location.search).get('origin') ?? ''
const childSrc = `${origin}${location.pathname.replace(/[^/]*$/, '')}child/frame.content.html`

// <Activity mode="hidden"> hides the iframe with display: none, so its page
// stays loaded, but unmounts the component's effects until it is shown again
function App() {
  const [shown, setShown] = useState(true)
  const [bodyBackground, setBodyBackground] = useState('rgb(255, 255, 255)')

  return (
    <>
      <button id="hide" onClick={() => setShown(false)}>
        Hide
      </button>
      <button id="show" onClick={() => setShown(true)}>
        Show
      </button>
      <button id="recolour" onClick={() => setBodyBackground('rgb(0, 128, 0)')}>
        Recolour
      </button>
      <Activity mode={shown ? 'visible' : 'hidden'}>
        <IframeResizer
          id="kept"
          src={childSrc}
          license="GPLv3"
          bodyBackground={bodyBackground}
          onReady={() => {
            ;(window as any).readyCount = ((window as any).readyCount ?? 0) + 1
          }}
          style={{ width: '100%' }}
        />
      </Activity>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
