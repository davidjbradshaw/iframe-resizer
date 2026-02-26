<template>
  <iframe ref="iframeRef" v-bind="$attrs"></iframe>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, toRaw } from 'vue'
  import type { PropType } from 'vue'
  import connectResizer from '@iframe-resizer/core'
  import type { IFrameObject, LogOption } from '@iframe-resizer/core'
  import acg from 'auto-console-group'

  const EXPAND = 'expanded'
  const COLLAPSE = 'collapsed'

  const esModuleInterop = (mod: any) =>
    // eslint-disable-next-line no-underscore-dangle
    mod?.__esModule ? mod.default : mod

  // Deal with UMD not converting default exports to named exports
  const createAutoConsoleGroup = esModuleInterop(acg)

  defineOptions({ name: 'IframeResizer' })

  const props = defineProps({
    license: {
      type: String,
      required: true,
    },
    bodyBackground: String,
    bodyMargin: String,
    bodyPadding: String,
    checkOrigin: {
      type: Boolean,
      default: true,
    },
    direction: String,
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
    inPageLinks: Boolean,
    offset: Number,
    scrolling: Boolean,
    tolerance: Number,
    warningTimeout: Number,
  })

  const emit = defineEmits<{
    onReady: [...args: any[]]
    onMessage: [...args: any[]]
    onResized: [...args: any[]]
  }>()

  const iframeRef = ref<HTMLIFrameElement | null>(null)
  const resizer = ref<IFrameObject | null>(null)

  onMounted(() => {
    const consoleGroup = createAutoConsoleGroup()
    // Template refs are guaranteed populated before onMounted fires
    const iframe = iframeRef.value!
    const options: any = {
      ...Object.fromEntries(
        Object.entries(toRaw(props)).filter(([, value]) => value !== undefined),
      ),
      waitForLoad: true,

      onBeforeClose: () => {
        consoleGroup.event('Blocked Close Event')
        consoleGroup.warn('Close method is disabled, use Vue to remove iframe')
        return false
      },
      onReady: (...args: any[]) => emit('onReady', ...args),
      onMessage: (...args: any[]) => emit('onMessage', ...args),
      onResized: (...args: any[]) => emit('onResized', ...args),
    }

    consoleGroup.label(`vue(${iframe.id})`)
    consoleGroup.event('setup')

    resizer.value = connectResizer(options)(iframe)

    consoleGroup.expand(options.logExpand)
    if ([COLLAPSE, EXPAND, true].includes(options.log as any)) {
      consoleGroup.log('Created Vue component')
    }
  })

  onBeforeUnmount(() => {
    resizer.value?.disconnect()
  })

  defineExpose({
    moveToAnchor: (anchor: string) => resizer.value?.moveToAnchor(anchor),
    resize: () => resizer.value?.resize(),
    sendMessage: (msg: any, target?: string) =>
      resizer.value?.sendMessage(msg, target),
  })
</script>
