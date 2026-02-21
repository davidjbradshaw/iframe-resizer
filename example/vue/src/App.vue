<script setup>
  import { ref } from 'vue'
  import IframeResizer from '@iframe-resizer/vue/sfc'

  const messageData = ref(null)

  const onResized = (data) => {
    messageData.value = data
  }

  const onMessage = (data) => {
    messageData.value = data
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }
</script>

<template>
  <h2>@iframe-resizer/vue example</h2>
  <IframeResizer
    src="child/frame.content.html" 
    license="GPLv3"
    log
    inPageLinks
    @on-message="onMessage"
    @on-resized="onResized"
  />
  
  <div v-if="messageData" class="message-data">
    <h3>Message Data:</h3>
    <pre>{{ JSON.stringify(messageData, null, 2) }}</pre>
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
