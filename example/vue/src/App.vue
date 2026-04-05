<script setup>
  import { ref } from 'vue'
  import IframeResizer from '@iframe-resizer/vue/sfc'

  const eventData = ref(null)

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
  <IframeResizer
    id="myframe"
    src="child/frame.content.html"
    license="GPLv3"
    log
    inPageLinks
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
