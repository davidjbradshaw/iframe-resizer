<script setup>
  import { ref } from 'vue'

  import FramePane from './FramePane.vue'
  import OtherPane from './OtherPane.vue'

  // The frame's pane is cached while hidden, and its DOM taken out of the page.
  // A cached pane gets no prop updates, so the colour reaches the resizer
  // when the pane is shown again, as it would in an app
  const shown = ref(true)
  const bodyBackground = ref('rgb(255, 255, 255)')
</script>

<template>
  <h2>@iframe-resizer/vue in KeepAlive</h2>
  <button id="hide" @click="shown = false">Hide</button>
  <button id="show" @click="shown = true">Show</button>
  <button id="recolour" @click="bodyBackground = 'rgb(0, 128, 0)'">
    Recolour
  </button>
  <KeepAlive>
    <FramePane v-if="shown" :body-background="bodyBackground" />
    <OtherPane v-else />
  </KeepAlive>
</template>
