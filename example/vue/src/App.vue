<script setup>
  import IframeResizer from '@iframe-resizer/vue/sfc'
</script>

<template>
  <h1>Vue 3 + Iframe Resizer</h1>
  <IframeResizer
    src="/example/html/child/frame.content.html" 
    license="GPLv3"
    log="collapsed"
    @on-ready="() => console.log('onReady')"
  />
</template>

<style scoped>
  iframe {
    width: 100%;
    min-height: 100px;
  }
</style>
