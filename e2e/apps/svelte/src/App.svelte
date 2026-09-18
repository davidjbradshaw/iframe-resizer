<script>
  import IframeResizer from '@iframe-resizer/svelte'

  let extra = {}

  // Option changes applied after init by the e2e tests, one button per step
  const UPDATES = {
    styles: {
      bodyBackground: 'rgb(0, 128, 0)',
      bodyPadding: '6px',
      bodyMargin: '12px',
      scrolling: true,
      checkOrigin: [location.origin],
    },
    offset: { offsetSize: 100 },
    tolerance: { tolerance: 1000 },
    links: { inPageLinks: false },
  }

  function update(step) {
    extra = { ...extra, ...UPDATES[step] }
  }

  function onResized(event) {
    console.log('resized', event.detail)
  }

  function onMessage(event) {
    const data = event.detail
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
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
  on:ready={onResized}
  on:message={onMessage}
  on:resized={onResized}
  src="child/frame.test.html"
  style="width: 100%; height: 100vh"
/>
