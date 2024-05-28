<template>
  <iframe ref="iframe" v-bind="$attrs"></iframe>
</template>

<script setup>
  import connectResizer from '@iframe-resizer/core'

  const emit = defineEmits(['onReady', 'onMessage', 'onResized'])

  window.vueIframeResizer = { emit }

  defineProps({
      license: {
        type: String,
        required: true
      },
      bodyBackground: {
        type: String,
      },
      bodyMargin: {
        type: String,
      },
      bodyPadding: {
        type: String,
      },
      checkOrigin: {
        type: Boolean,
        default: true,
      },
      direction: {
        type: String,
      },
      inPageLinks: {
        type: Boolean,
      },
      offset: {
        type: Number,
      },
      scrolling: {
        type: Boolean,
      },
      tolerance: {
        type: Number,
      },
      warningTimeout: {
        type: Number,
      },
    })

  defineOptions({
    name: 'IframeResizer',
    
    mounted() {
      const options = {
        ...Object.fromEntries(
          Object
            .entries(this.$props)
            .filter(([key, value]) => value !== undefined)
        ),
        onClose:() => false, // Disable close methods, use Vue to remove iframe
        onReady: (...args) => window.vueIframeResizer.emit('onReady', ...args),
        onMessage: (...args) => window.vueIframeResizer.emit('onMessage', ...args),
        onResized: (...args) => window.vueIframeResizer.emit('onResized', ...args),
      }

      const connectWithOptions = connectResizer(options)
      this.$refs.iframe.addEventListener("load", () => window.r =connectWithOptions(this.$refs.iframe))
    },
    
    beforeDestroy() {
      if (this.$refs.iframe.iFrameResizer) {
        this.$refs.iframe.iFrameResizer.disconnect();
      }
    }
  })

</script>
