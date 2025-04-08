<template>
  <iframe ref="iframe" v-bind="$attrs"></iframe>
</template>

<script>
  import connectResizer from '@iframe-resizer/core'
  import autoConsoleGroup from 'auto-console-group'

  const EXPAND = 'expanded'

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
      log: {
        type: String || Boolean,
        default: false,
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

        onClose: () => {
          consoleGroup.event('onClose')
          consoleGroup.warn('Close method is disabled, use Vue to remove iframe')
          return false
        },
        onReady: (...args) => self.$emit('onReady', ...args),
        onMessage: (...args) => self.$emit('onMessage', ...args),
        onResized: (...args) => self.$emit('onResized', ...args),
      }

      if (options.log === '') options.log = true

      const connectWithOptions = connectResizer(options)
      self.resizer = connectWithOptions(iframe)

      const consoleOptions = {
        label: `Vue(${iframe.id})`,
        expand: options.logExpand, // set inside connectResizer
      }

      const consoleGroup = autoConsoleGroup(consoleOptions)
      consoleGroup.event('setup')
      if (options.log) consoleGroup.log('Created Vue competent')
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
