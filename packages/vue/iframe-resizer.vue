<template>
  <iframe ref="iframe" v-bind="$attrs"></iframe>
</template>

<script lang="ts">
  import type { PropType } from 'vue'
  import connectResizer from '@iframe-resizer/core'
  import acg from 'auto-console-group'

  const EXPAND = 'expanded'
  const COLLAPSE = 'collapsed'

  type LogOption = 'expanded' | 'collapsed' | boolean | -1

  interface IframeResizerObject {
    disconnect: () => void
    moveToAnchor: (anchor: string) => void
    resize: () => void
    sendMessage: (msg: any, target?: string) => void
  }

  const esModuleInterop = (mod: any) =>
    // eslint-disable-next-line no-underscore-dangle
    mod?.__esModule ? mod.default : mod

  // Deal with UMD not converting default exports to named exports
  const createAutoConsoleGroup = esModuleInterop(acg)

  export default {
    name: 'IframeResizer',

    props: {
      license: {
        type: String,
        required: true,
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
        type: [String, Boolean, Number] as PropType<LogOption>,
        validator: (value: LogOption) => {
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

    data() {
      return {
        resizer: null as IframeResizerObject | null,
      }
    },

    mounted() {
      const self = this
      const { iframe } = this.$refs as { iframe: HTMLIFrameElement }
      const options: any = {
        ...Object.fromEntries(
          Object.entries(this.$props).filter(
            ([key, value]) => value !== undefined
          )
        ),
        waitForLoad: true,

        onBeforeClose: () => {
          consoleGroup.event('Blocked Close Event')
          consoleGroup.warn('Close method is disabled, use Vue to remove iframe')
          return false
        },
        onReady: (...args: any[]) => self.$emit('onReady', ...args),
        onMessage: (...args: any[]) => self.$emit('onMessage', ...args),
        onResized: (...args: any[]) => self.$emit('onResized', ...args),
      }

      const connectWithOptions = connectResizer(options)
      self.resizer = connectWithOptions(iframe)

      const consoleOptions = {
        label: `vue(${iframe.id})`,
        expand: (options as any).logExpand, // set inside connectResizer
      }

      const consoleGroup = createAutoConsoleGroup(consoleOptions)
      consoleGroup.event('setup')

      if ([COLLAPSE, EXPAND, true].includes(options.log as any)) {
        consoleGroup.log('Created Vue component')
      }
    },

    // Vue 2 lifecycle hook
    beforeDestroy() {
      this.resizer?.disconnect()
    },

    // Vue 3 lifecycle hook
    beforeUnmount() {
      this.resizer?.disconnect()
    },

    methods: {
      moveToAnchor(anchor: string) {
        this.resizer?.moveToAnchor(anchor)
      },
      resize() {
        this.resizer?.resize()
      },
      sendMessage(msg: any, target?: string) {
        this.resizer?.sendMessage(msg, target)
      },
    },
  }
</script>
