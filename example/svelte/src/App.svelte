<script>
  import IframeResizer from '@iframe-resizer/svelte'

  // Each page sets <body data-example>, see index.html, two.html and width-*.html
  const example = document.body.dataset.example ?? 'index'

  const DIRECTIONS = {
    'width-inline': 'horizontal-inline',
    'width-block': 'horizontal-block',
  }
  const direction = DIRECTIONS[example]
  const src = direction ? 'child/frame.width.html' : 'child/frame.content.html'
  const ids = example === 'two' ? ['myIframe1', 'myIframe2'] : ['myIframe']

  let eventData = null

  function onResized(event) {
    eventData = event.detail
  }

  function onMessage(event) {
    eventData = event.detail
    alert(`Message from frame ${event.detail.iframe.id}: ${event.detail.message}`)
    event.detail.iframe.iframeResizer.sendMessage('Hello back from the parent page')
  }
</script>

<h2>@iframe-resizer/svelte example</h2>
<nav>
  <a href="index.html">One iframe</a>
  <a href="two.html">Two iframes</a>
  <a href="width-inline.html">Width (inline)</a>
  <a href="width-block.html">Width (block)</a>
</nav>

<div class="frames" class:width={direction}>
  {#each ids as id (id)}
    <IframeResizer
      {id}
      {src}
      {direction}
      license="GPLv3"
      log
      inPageLinks
      on:message={onMessage}
      on:resized={onResized}
    />
  {/each}
</div>

{#if eventData}
  <div class="message-data">
    <h3>Event Data:</h3>
    <pre>{JSON.stringify(eventData, (key, value) => key === 'iframe' ? undefined : value, 2)}</pre>
  </div>
{/if}

<style>
  nav {
    margin-bottom: 16px;
  }

  nav a {
    margin-right: 16px;
  }

  .frames {
    display: flex;
    gap: 2%;
    align-items: flex-start;
    margin-top: 16px;
  }

  .frames :global(iframe) {
    flex: 1;
    min-width: 0;
    height: 100vh;
  }

  /* The width examples size the iframe to its content */
  .frames.width :global(iframe) {
    flex: none;
    height: 300px;
  }
  .message-data {
    margin-top: 20px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .message-data h3 {
    margin: 0 0 8px;
  }

  .message-data pre {
    margin: 0;
    overflow: auto;
  }
  pre {
    overflow: auto;
  }
</style>
