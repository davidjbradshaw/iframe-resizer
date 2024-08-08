<script setup>
  import IframeResizer from '@iframe-resizer/vue/sfc'
</script>

<template>
  <h1>Vue 3 + Iframe Resizer</h1>
  <IframeResizer
    src="https://iframe-resizer.com/examples/animate/" 
    license="GPLv3" 
    bodyBackground="green" 
    @on-ready="() => console.log('onReady')"
  />
</template>

<style scoped>
  iframe {
    width: 100%;
    height: 100vh;
  }
</style>
