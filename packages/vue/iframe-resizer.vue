<template>
  <iframe ref="iframe" v-bind="$attrs"></iframe>
</template>

<script>
  import connectResizer from '@iframe-resizer/core'
  import acg from 'auto-console-group'
  import { EXPAND, COLLAPSE } from '../common/consts'

  const esModuleInterop = (mod) =>
    // eslint-disable-next-line no-underscore-dangle
    mod?.__esModule ? mod.default : mod

  // Deal with UMD not converting default exports to named exports
  const createAutoConsoleGroup = esModuleInterop(acg)

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
        type: [String, Boolean, Number],
        validator: (value) => {
          switch (value) {
            case COLLAPSE:
            case EXPAND:
            case false:
            case true:
            case -1:
              return true
            default:
              return false
          }
        },
        default: undefined,
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

        onBeforeClose: () => {
          consoleGroup.event('Blocked Close Event')
          consoleGroup.warn('Close method is disabled, use Vue to remove iframe')
          return false
        },
        onReady: (...args) => self.$emit('onReady', ...args),
        onMessage: (...args) => self.$emit('onMessage', ...args),
        onResized: (...args) => self.$emit('onResized', ...args),
      }

      const connectWithOptions = connectResizer(options)
      self.resizer = connectWithOptions(iframe)

      const consoleOptions = {
        label: `vue(${iframe.id})`,
        expand: options.logExpand, // set inside connectResizer
      }

      const consoleGroup = createAutoConsoleGroup(consoleOptions)
      consoleGroup.event('setup')

      if ([COLLAPSE, EXPAND, true].includes(options.log)) {
        consoleGroup.log('Created Vue component')
      }
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
