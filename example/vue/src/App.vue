<script setup>
  import IframeResizer from '@iframe-resizer/vue/sfc'

  const onReady = () => {
    console.log('onReady')
  }
</script>

<template>
  <h1>Vue 3 + Iframe Resizer</h1>
  <IframeResizer class="iframe" src="https://iframe-resizer.com/examples/animate/" license="GPLv3" bodyBackground="green" @on-ready="() => console.log('onReady')"/>
</template>

<style scoped>
  .iframe {
    width: 100% !important;
    height: 100vh;
  }
</style>
