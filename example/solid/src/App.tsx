import { createSignal, For, Show } from 'solid-js'
import IframeResizer from '@iframe-resizer/solid'
import type {
  IFrameDirection,
  IFrameMessageData,
  IFrameResizedData,
  IFrameResizerMethods,
} from '@iframe-resizer/solid'

import './App.css'

// Each page sets <body data-example>, see index.html, two.html and width-*.html
const example = document.body.dataset.example ?? 'index'

const DIRECTIONS: Record<string, string> = {
  'width-inline': 'horizontal-inline',
  'width-block': 'horizontal-block',
}
const direction = DIRECTIONS[example] as IFrameDirection | undefined
const src = direction
  ? `child/frame.width.html?direction=${direction}`
  : 'child/frame.content.html'
const TITLES: Record<string, string> = {
  index: 'one iframe',
  two: 'two iframes',
  'width-inline': 'width (inline)',
  'width-block': 'width (block)',
}
const ids = example === 'two' ? ['myIframe1', 'myIframe2'] : ['myIframe']

function Nav() {
  return (
    <nav>
      <a href="index.html">One iframe</a>
      <a href="two.html">Two iframes</a>
      <a href="width-inline.html">Width (inline)</a>
      <a href="width-block.html">Width (block)</a>
    </nav>
  )
}

function App() {
  const iframeApis: Record<string, IFrameResizerMethods> = {}
  const [messageData, setMessageData] = createSignal<IFrameResizedData | IFrameMessageData>()
  const [show, setShow] = createSignal(true)

  const onResized = (data: IFrameResizedData) => setMessageData(data)

  const onMessage = (data: IFrameMessageData) => {
    setMessageData(data)
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
    iframeApis[data.iframe.id]?.sendMessage('Hello back from the parent page')
  }

  return (
    <>
      <h2>@iframe-resizer/solid example: {TITLES[example]}</h2>
      <Nav />
      <button onClick={() => setShow(!show())}>{show() ? 'Hide' : 'Show'}</button>
      <Show when={show()}>
        <div class={direction ? 'frames width' : 'frames'}>
          <For each={ids}>
            {(id) => (
              <IframeResizer
                license="GPLv3"
                id={id}
                log
                ref={(api) => (iframeApis[id] = api)}
                {...(direction && { direction })}
                inPageLinks
                onMessage={onMessage}
                onResized={onResized}
                src={src}
              />
            )}
          </For>
        </div>
        <Show when={messageData()}>
          <div class="message-data">
            <h3>Event Data:</h3>
            <pre>
              {JSON.stringify(messageData(), (key, value) => (key === 'iframe' ? undefined : value), 2)}
            </pre>
          </div>
        </Show>
      </Show>
    </>
  )
}

export default App
