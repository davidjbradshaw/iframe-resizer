import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import IframeResizer from '@iframe-resizer/react'

// Confirmation page for finding 16.1: a prop changes before the child is ready.
// The child page waits for a '16.1:go' message before it loads the child
// script, so the option change is guaranteed to land before INIT.
const CHILD = '/e2e/fixtures/confirm/16.1-react-early-update-child.html'

// ?late changes the direction after onReady instead, as a control
const LATE = location.search.includes('late')

function App() {
  const [direction, setDirection] = useState<'vertical' | 'horizontal-inline'>(
    'vertical',
  )
  const [childLoaded, setChildLoaded] = useState(false)
  const [status, setStatus] = useState('pending')

  // Like a media-query hook: starts false, flips in an effect after mount
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data === '16.1:loaded') setChildLoaded(true)
    }
    window.addEventListener('message', onMessage)
    if (!LATE) setDirection('horizontal-inline')
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Only release the child once the new direction has been rendered
  useEffect(() => {
    if (childLoaded && (LATE || direction === 'horizontal-inline')) {
      const frame = document.getElementById('frame') as HTMLIFrameElement
      frame.contentWindow?.postMessage('16.1:go', '*')
    }
  }, [childLoaded, direction])

  return (
    <>
      <p>
        Direction: <span id="direction">{direction}</span> Ready:{' '}
        <span id="status">{status}</span>
      </p>
      <IframeResizer
        id="frame"
        license="GPLv3"
        log
        direction={direction}
        onReady={() => {
          if (LATE) setDirection('horizontal-inline')
          setStatus('ready')
        }}
        src={CHILD}
        style={{ width: '600px', height: '100px' }}
      />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
