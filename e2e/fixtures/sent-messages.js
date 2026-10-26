// Every message the child sends to the parent, on either route, collected in
// window.sentMessages. Call once iframeResize() has run, as it sets up the
// listener a same-origin child calls directly.
window.recordSentMessages = () => {
  window.sentMessages = []
  const record = (data) => {
    if (typeof data === 'string' && data.startsWith('[iFrameSizer]'))
      window.sentMessages.push(data)
  }
  window.addEventListener('message', (event) => record(event.data))

  const listener = window.iframeParentListener
  window.iframeParentListener = (data) => {
    record(data)
    return listener(data)
  }
}
