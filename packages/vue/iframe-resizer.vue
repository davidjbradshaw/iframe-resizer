<template>
  <iframe ref="iframe" v-bind="$attrs"></iframe>
</template>

<script>
  import connectResizer from '@iframe-resizer/core'

  export default {
    name: 'IframeResizer',

    props: {
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
    },
    
    mounted() {
      const self = this
      const { iframe } = this.$refs
      const options = {
        ...Object.fromEntries(
          Object
            .entries(this.$props)
            .filter(([key, value]) => value !== undefined)
        ),
        waitForLoad: true,

        onClosed: () => false, // Disable close methods, use Vue to remove iframe
        onReady: (...args) => self.$emit('onReady', ...args),
        onMessage: (...args) => self.$emit('onMessage', ...args),
        onResized: (...args) => self.$emit('onResized', ...args),
      }

      const connectWithOptions = connectResizer(options)

      self.resizer = connectWithOptions(iframe)
    },
    
    beforeUnmount() {
      this.resizer?.disconnect()
    },

    methods: {
      moveToAnchor(anchor) {
        this.resizer.moveToAnchor(anchor)
      },
      resize() {
        this.resizer.resize()
      },
      sendMessage(msg, target) {
        this.resizer.sendMessage(msg, target)
      },
    },
  }

</script>
