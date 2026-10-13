<script setup>
  import { onMounted, ref, watchEffect } from 'vue'
  import IframeResizer from '@iframe-resizer/vue/sfc'

  // Changes two options before the child is ready, in a mounted hook, which
  // runs after the component has bound the iframe. The child page holds its
  // script back until told to go, so the change always comes before init.
  // ?late makes the same change after onReady instead, as a control.
  const EARLY = {
    direction: 'horizontal-inline',
    bodyBackground: 'rgb(0, 128, 0)',
  }
  const LATE = location.search.includes('late')

  const options = ref({})
  const childLoaded = ref(false)
  const status = ref('pending')

  window.addEventListener('message', (event) => {
    if (event.data === 'early-update:loaded') childLoaded.value = true
  })

  onMounted(() => {
    if (!LATE) options.value = EARLY
  })

  // Only release the child once the change has been made
  watchEffect(() => {
    if (childLoaded.value && (LATE || options.value.direction)) {
      document
        .getElementById('frame')
        .contentWindow?.postMessage('early-update:go', '*')
    }
  })

  const onReady = () => {
    if (LATE) options.value = EARLY
    status.value = 'ready'
  }
</script>

<template>
  <p>
    Direction: <span id="direction">{{ options.direction ?? 'vertical' }}</span>
    Ready: <span id="status">{{ status }}</span>
  </p>
  <IframeResizer
    id="frame"
    license="GPLv3"
    log
    v-bind="options"
    @on-ready="onReady"
    src="child/frame.early-update.html"
    style="width: 600px; height: 100px"
  />
</template>
