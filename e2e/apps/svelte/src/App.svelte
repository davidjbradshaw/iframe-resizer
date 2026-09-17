<script>
  import IframeResizer from '@iframe-resizer/svelte'

  let bodyBackground

  function onResized(event) {
    console.log('resized', event.detail)
  }

  function onMessage(event) {
    const data = event.detail
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }
</script>

<h2>@iframe-resizer/svelte example</h2>

<button id="update-option" on:click={() => (bodyBackground = 'rgb(0, 128, 0)')}>
  Update option
</button>

<IframeResizer
  license="GPLv3"
  id="myIframe"
  log="collapsed"
  inPageLinks
  {bodyBackground}
  on:ready={onResized}
  on:message={onMessage}
  on:resized={onResized}
  src="child/frame.test.html"
  style="width: 100%; height: 100vh"
/>
