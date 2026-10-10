<script setup>
  import { ref } from 'vue'
  import IframeResizer from '@iframe-resizer/vue/sfc'

  // Each page sets <body data-example>, see index.html, two.html and width-*.html
  const example = document.body.dataset.example ?? 'index'

  const DIRECTIONS = {
    'width-inline': 'horizontal-inline',
    'width-block': 'horizontal-block',
  }
  const direction = DIRECTIONS[example]
  const src = direction
    ? `child/frame.width.html?direction=${direction}`
    : 'child/frame.content.html'
  const TITLES = {
    index: 'one iframe',
    two: 'two iframes',
    'width-inline': 'width (inline)',
    'width-block': 'width (block)',
  }
  const ids = example === 'two' ? ['myIframe1', 'myIframe2'] : ['myIframe']

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
  <h2>@iframe-resizer/vue example: {{ TITLES[example] }}</h2>
  <nav>
    <a href="index.html">One iframe</a>
    <a href="two.html">Two iframes</a>
    <a href="width-inline.html">Width (inline)</a>
    <a href="width-block.html">Width (block)</a>
  </nav>

  <div :class="['frames', { width: direction }]">
    <IframeResizer
      v-for="id in ids"
      :key="id"
      :id="id"
      :src="src"
      :direction="direction"
      license="GPLv3"
      log="collapsed"
      inPageLinks
      @on-message="onMessage"
      @on-resized="onResized"
    />
  </div>

  <div v-if="eventData" class="message-data">
    <h3>Event Data:</h3>
    <pre>{{ JSON.stringify(eventData, (key, value) => key === 'iframe' ? undefined : value, 2) }}</pre>
  </div>
</template>

<style scoped>
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

  .frames iframe {
    flex: 1;
    min-width: 0;
    height: 100vh;
  }

  /* The width examples size the iframe to its content */
  .frames.width iframe {
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
