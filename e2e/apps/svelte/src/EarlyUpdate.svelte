<script>
  import { onMount } from 'svelte'
  import IframeResizer from '@iframe-resizer/svelte'

  // Changes two options before the child is ready, in onMount, which runs
  // after the component has bound the iframe. The child page holds its script
  // back until told to go, so the change always comes before init. ?late
  // makes the same change after onReady instead, as a control.
  const EARLY = {
    direction: 'horizontal-inline',
    bodyBackground: 'rgb(0, 128, 0)',
  }
  const LATE = location.search.includes('late')

  let options = {}
  let childLoaded = false
  let status = 'pending'

  onMount(() => {
    const onMessage = (event) => {
      if (event.data === 'early-update:loaded') childLoaded = true
    }
    window.addEventListener('message', onMessage)
    if (!LATE) options = EARLY
    return () => window.removeEventListener('message', onMessage)
  })

  // Only release the child once the change has been made
  $: if (childLoaded && (LATE || options.direction)) {
    document
      .getElementById('frame')
      ?.contentWindow?.postMessage('early-update:go', '*')
  }

  function onReady() {
    if (LATE) options = EARLY
    status = 'ready'
  }
</script>

<p>
  Direction: <span id="direction">{options.direction ?? 'vertical'}</span>
  Ready: <span id="status">{status}</span>
</p>

<IframeResizer
  id="frame"
  license="GPLv3"
  log
  {...options}
  on:ready={onReady}
  src="child/frame.early-update.html"
  style="width: 600px; height: 100px"
/>
