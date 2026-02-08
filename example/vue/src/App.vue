<script setup lang="ts">
  import IframeResizer from '@iframe-resizer/vue/sfc'
  import type { IFrameComponent } from '@iframe-resizer/vue/sfc'

  const handleReady = (iframe: IFrameComponent) => {
    console.log('onReady', iframe)
  }

  const handleMessage = (data: { iframe: IFrameComponent; message: any }) => {
    console.log('onMessage', data.message)
  }

  const handleResized = (data: { 
    iframe: IFrameComponent; 
    height: number; 
    width: number; 
    type: string 
  }) => {
    console.log('onResized', data.height, data.width, data.type)
  }
</script>

<template>
  <h1>Vue 3 + Iframe Resizer (TypeScript)</h1>
  <IframeResizer
    src="https://iframe-resizer.com/examples/animate/" 
    license="GPLv3"
    log="collapsed"
    bodyBackground="green"
    :direction="'vertical'"
    @on-ready="handleReady"
    @on-message="handleMessage"
    @on-resized="handleResized"
  />
</template>

<style scoped>
  iframe {
    width: 100%;
    height: 100vh;
  }
</style>
