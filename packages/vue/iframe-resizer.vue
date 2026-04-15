<template>
  <iframe ref="iframeRef" v-bind="$attrs"></iframe>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, toRaw } from 'vue'
  import type { PropType } from 'vue'
  import connectResizer from '@iframe-resizer/core'
  import type {
    IframeComponent,
    IframeLogOption,
    IframeMessageData,
    IframeObject,
    IframeResizedData,
  } from '@iframe-resizer/core'
  import { esModuleInterop } from '@iframe-resizer/common'
  import { COLLAPSE, EXPAND } from '@iframe-resizer/common/consts'
  import acg from 'auto-console-group'

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
      type: [String, Boolean, Number] as PropType<IframeLogOption>,
      validator: (value: IframeLogOption) => {
        switch (value) {
          case COLLAPSE:
          case EXPAND:
          case false:
          case true:
          case -1:
          case 0:
          case 1:
          case 2:
            return true
          default:
            return false
        }
      },
      default: undefined,
    },
    inPageLinks: Boolean,
    offsetSize: Number,
    scrolling: Boolean,
    tolerance: Number,
    warningTimeout: Number,
  })

  const emit = defineEmits<{
    onReady: [iframe: IframeComponent]
    onMessage: [data: IframeMessageData]
    onResized: [data: IframeResizedData]
  }>()

  const iframeRef = ref<HTMLIFrameElement | null>(null)
  const resizer = ref<IframeObject | null>(null)

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
      onReady: (iframe: IframeComponent) => emit('onReady', iframe),
      onMessage: (data: IframeMessageData) => emit('onMessage', data),
      onResized: (data: IframeResizedData) => emit('onResized', data),
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
    sendMessage: (msg: any, target?: string) =>
      resizer.value?.sendMessage(msg, target),
  })
</script>
