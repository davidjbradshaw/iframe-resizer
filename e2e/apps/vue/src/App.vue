<script setup>
  import { ref } from 'vue'
  import IframeResizer from '@iframe-resizer/vue/sfc'

  const eventData = ref(null)
  const extra = ref({})

  // Option changes applied after init by the e2e tests, one button per step
  const UPDATES = {
    styles: {
      bodyBackground: 'rgb(0, 128, 0)',
      bodyPadding: '6px',
      bodyMargin: '12px',
      scrolling: true,
      checkOrigin: [location.origin],
    },
    offset: { bodyBackground: 'rgb(0, 0, 128)', offsetSize: 100 },
    tolerance: { bodyBackground: 'rgb(128, 0, 0)', tolerance: 1000 },
    links: { bodyBackground: 'rgb(128, 128, 0)', inPageLinks: false },
    direction: { bodyBackground: 'rgb(0, 128, 128)', direction: 'horizontal' },
  }

  const update = (step) => {
    extra.value = { ...extra.value, ...UPDATES[step] }
  }

  const onResized = (data) => {
    eventData.value = data
  }

  const onMessage = (data) => {
    eventData.value = data
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
    data.iframe.iframeResizer.sendMessage('Hello back from the parent page')
  }
</script>

<template>
  <h2>@iframe-resizer/vue example</h2>
  <button
    v-for="(options, step) in UPDATES"
    :key="step"
    :id="`update-${step}`"
    @click="update(step)"
  >
    Update {{ step }}
  </button>
  <IframeResizer
    id="myframe"
    src="child/frame.test.html"
    license="GPLv3"
    log="collapsed"
    inPageLinks
    v-bind="extra"
    @on-message="onMessage"
    @on-resized="onResized"
  />

  <div v-if="eventData" class="message-data">
    <h3>Event Data:</h3>
    <pre>{{ JSON.stringify(eventData, (key, value) => key === 'iframe' ? undefined : value, 2) }}</pre>
  </div>
</template>

<style scoped>
  iframe {
    width: 100%;
    height: 100vh;
  }
</style>
