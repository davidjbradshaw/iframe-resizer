import IframeResizer from '@iframe-resizer/react'

import './App.css'

function App() {
  return (
    <>
      <h2>@iframe-resizer/react test page</h2>
      <IframeResizer
        license="GPL-V3"
        src="/child/frame.content.html"
        style={{ width: '100%' }}  
      />
    </>
  )
}

export default App
