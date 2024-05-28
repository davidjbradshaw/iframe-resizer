<template>
  <iframe ref="iframe" v-bind="$attrs"></iframe>
</template>

<script setup>
  import connectResizer from '@iframe-resizer/core'

  const emit = defineEmits(['onReady', 'onMessage', 'onResized'])

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
      const self = this
      const { iframe } = this.$refs
      const options = {
        ...Object.fromEntries(
          Object
            .entries(this.$props)
            .filter(([key, value]) => value !== undefined)
        ),

        onClose:() => false, // Disable close methods, use Vue to remove iframe
        onReady: (...args) => self.$emit('onReady', ...args),
        onMessage: (...args) => self.$emit('onMessage', ...args),
        onResized: (...args) => self.$emit('onResized', ...args),
      }

      const connectWithOptions = connectResizer(options)

      iframe.addEventListener("load", () => connectWithOptions(iframe))
    },
    
    beforeDestroy() {
      if (this.$refs.iframe.iFrameResizer) {
        this.$refs.iframe.iFrameResizer.disconnect();
      }
    }
  })

</script>
