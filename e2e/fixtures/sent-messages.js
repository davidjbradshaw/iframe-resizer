// Every message the child sends to the parent, on either route, collected in
// window.sentMessages. Call once, after iframeResize(), which sets up the
// listener a same-origin child calls directly.
window.recordSentMessages = () => {
  if (window.sentMessages) throw new Error('recordSentMessages() called twice')
  const listener = window.iframeParentListener
  if (typeof listener !== 'function')
    throw new Error('recordSentMessages() called before iframeResize()')

  window.sentMessages = []
  const record = (data) => {
    if (typeof data === 'string' && data.startsWith('[iFrameSizer]'))
      window.sentMessages.push(data)
  }
  window.addEventListener('message', (event) => record(event.data))

  window.iframeParentListener = (data) => {
    record(data)
    return listener(data)
  }
}
