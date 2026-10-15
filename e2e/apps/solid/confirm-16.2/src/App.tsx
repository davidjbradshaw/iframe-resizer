import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import IframeResizer from '@iframe-resizer/solid'

// Finding 16.2: a wire option that changes while the child is still loading
// should reach the child once it is ready, without a console error.
declare global {
  interface Window {
    appMounted: boolean
    childReady: boolean
    setBackground: (value: string) => void
  }
}

function App() {
  const [bg, setBg] = createSignal('rgb(255, 255, 255)')

  window.childReady = false
  window.setBackground = setBg

  return (
    <>
      <h2>Confirm 16.2: Solid option change before child init</h2>
      <IframeResizer
        license="GPLv3"
        id="confirmFrame"
        bodyBackground={bg()}
        onReady={() => {
          window.childReady = true
        }}
        src="/e2e/fixtures/confirm/16.2-solid-early-update-child.html"
        style={{ width: '100%', height: '200px' }}
      />
    </>
  )
}

render(() => <App />, document.getElementById('root')!)
// Effects have run once render returns, so the resizer is bound
window.appMounted = true
