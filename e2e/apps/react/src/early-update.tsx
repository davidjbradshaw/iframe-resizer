import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import IframeResizer from '@iframe-resizer/react'

// Changes two options before the child is ready, as a prop that settles in an
// effect after mount does. The child page holds its script back until told to
// go, so the change always comes before init. ?late makes the same change
// after onReady instead, as a control.
const EARLY = {
  direction: 'horizontal-inline',
  bodyBackground: 'rgb(0, 128, 0)',
} as const
const LATE = location.search.includes('late')

function App() {
  const [options, setOptions] = useState<Partial<typeof EARLY>>({})
  const [childLoaded, setChildLoaded] = useState(false)
  const [status, setStatus] = useState('pending')

  // Like a media-query hook: starts with a default, settles after mount
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data === 'early-update:loaded') setChildLoaded(true)
    }
    window.addEventListener('message', onMessage)
    if (!LATE) setOptions(EARLY)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Only release the child once the change has been rendered
  useEffect(() => {
    if (childLoaded && (LATE || options.direction)) {
      const frame = document.getElementById('frame') as HTMLIFrameElement
      frame.contentWindow?.postMessage('early-update:go', '*')
    }
  }, [childLoaded, options])

  return (
    <>
      <p>
        Direction: <span id="direction">{options.direction ?? 'vertical'}</span>{' '}
        Ready: <span id="status">{status}</span>
      </p>
      <IframeResizer
        id="frame"
        license="GPLv3"
        log
        {...options}
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

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
