<script>
  import IframeResizer from '@iframe-resizer/svelte'

  let messageData = null

  function onResized(event) {
    messageData = event.detail
  }

  function onMessage(event) {
    messageData = event.detail
    alert(`Message from frame ${event.detail.iframe.id}: ${event.detail.message}`)
  }
</script>

<h2>@iframe-resizer/svelte example</h2>
<IframeResizer
  src="child/frame.content.html"
  license="GPLv3"
  log
  inPageLinks
  on:message={onMessage}
  on:resized={onResized}
/>

{#if messageData}
  <div class="message-data">
    <h3>Message Data:</h3>
    <pre>{JSON.stringify(messageData, null, 2)}</pre>
  </div>
{/if}

<style>
  :global(iframe) {
    width: 100%;
    height: 100vh;
  }
  .message-data {
    margin-top: 20px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
  }
  pre {
    overflow: auto;
  }
</style>
