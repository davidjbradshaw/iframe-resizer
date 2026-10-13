import { createEffect, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import IframeResizer from '@iframe-resizer/solid'

// Changes two options before the child is ready. The child page holds its
// script back until told to go, and the change is made once it has loaded,
// so it always comes after the iframe is bound and before init. ?late makes
// the same change after onReady instead, as a control.
const EARLY = {
  direction: 'horizontal-inline',
  bodyBackground: 'rgb(0, 128, 0)',
} as const
const LATE = location.search.includes('late')

function App() {
  const [options, setOptions] = createSignal<Partial<typeof EARLY>>({})
  const [childLoaded, setChildLoaded] = createSignal(false)
  const [status, setStatus] = createSignal('pending')

  window.addEventListener('message', (event) => {
    if (event.data !== 'early-update:loaded') return
    if (!LATE) setOptions(EARLY)
    setChildLoaded(true)
  })

  // Only release the child once the change has been made
  createEffect(() => {
    if (childLoaded() && (LATE || options().direction)) {
      const frame = document.getElementById('frame') as HTMLIFrameElement
      frame.contentWindow?.postMessage('early-update:go', '*')
    }
  })

  return (
    <>
      <p>
        Direction:{' '}
        <span id="direction">{options().direction ?? 'vertical'}</span> Ready:{' '}
        <span id="status">{status()}</span>
      </p>
      <IframeResizer
        id="frame"
        license="GPLv3"
        log
        {...options()}
        onReady={() => {
          if (LATE) setOptions(EARLY)
          setStatus('ready')
        }}
        src="child/frame.early-update.html"
        style={{ width: '600px', height: '100px' }}
      />
    </>
  )
}

render(() => <App />, document.getElementById('root')!)
