<script setup>
  import IframeResizer from '@iframe-resizer/vue/sfc'

  defineProps({ bodyBackground: String })

  const onReady = () => {
    window.readyCount = (window.readyCount ?? 0) + 1
  }
</script>

<template>
  <IframeResizer
    id="kept"
    src="child/frame.content.html"
    license="GPLv3"
    :body-background="bodyBackground"
    @on-ready="onReady"
  />
</template>
