<template>
  <iframe ref="iframe" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import connectResizer, { type IFrameObject, type ResizerOptions } from '@iframe-resizer/core';

const props = defineProps<ResizerOptions>()

const emit = defineEmits<{
  onReady: [...any[]]
  onMessage: [...any[]]
  onResized: [...any[]]
}>()

const iframe = ref<HTMLIFrameElement | null>(null)
const resizer = ref<IFrameObject | null>(null)

onMounted(() => {
  if (!iframe.value)
    return

  const options = {
    ...Object.fromEntries(
      Object.entries(props)
        .filter(([_, value]) => value !== undefined),
    ),
    waitForLoad: true,
    onClosed: () => false, // Disable close methods, use Vue to remove iframe
    onReady: (...args: any[]) => emit('onReady', ...args),
    onMessage: (...args: any[]) => emit('onMessage', ...args),
    onResized: (...args: any[]) => emit('onResized', ...args),
  }

  const connectWithOptions = connectResizer(options)
  resizer.value = connectWithOptions(iframe.value)
})

onBeforeUnmount(() => {
  resizer.value?.disconnect()
})

defineExpose({
  moveToAnchor: (anchor: string) => {
    resizer.value?.moveToAnchor(anchor)
  },
  resize: () => {
    resizer.value?.resize()
  },
  sendMessage: (message: string, targetOrigin?: string) => {
    resizer.value?.sendMessage(message, targetOrigin)
  },
})
</script>
