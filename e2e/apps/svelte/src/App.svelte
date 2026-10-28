<script>
  import IframeResizer from '@iframe-resizer/svelte'
  import { record, updates } from '../../../shared/app'

  let extra = {}

  // Option changes applied after init by the e2e tests, one button per step
  const UPDATES = updates(location.origin)

  function update(step) {
    extra = { ...extra, ...UPDATES[step] }
  }

  function onReady() {
    record('onReady')
  }

  function onResized(event) {
    record('onResized', { type: event.detail.type })
  }

  function onMessage(event) {
    const data = event.detail
    record('onMessage', { message: data.message })
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }

  function onScroll() {
    record('onScroll')
  }
</script>

<h2>@iframe-resizer/svelte example</h2>

{#each Object.keys(UPDATES) as step}
  <button id="update-{step}" on:click={() => update(step)}>Update {step}</button>
{/each}

<IframeResizer
  license="GPLv3"
  id="myIframe"
  log="collapsed"
  inPageLinks
  {...extra}
  on:ready={onReady}
  on:message={onMessage}
  on:resized={onResized}
  on:scroll={onScroll}
  src="child/frame.test.html"
  style="width: 100%; height: 100vh"
/>
