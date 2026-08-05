<template>
  <iframe ref="iframeRef" v-bind="$attrs"></iframe>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue'
  import type { PropType } from 'vue'
  import connectResizer from '@iframe-resizer/core'
  import type {
    IFrameComponent,
    IFrameLogOption,
    IFrameMessageData,
    IFrameObject,
    IFrameResizedData,
  } from '@iframe-resizer/core'
  import { esModuleInterop } from '@iframe-resizer/common'
  import { COLLAPSE, EXPAND, LOG_EXPANDED } from '@iframe-resizer/common/consts'
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
      type: [String, Boolean, Number] as PropType<IFrameLogOption>,
      validator: (value: IFrameLogOption) => {
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
    onReady: [iframe: IFrameComponent]
    onMessage: [data: IFrameMessageData]
    onResized: [data: IFrameResizedData]
  }>()

  const iframeRef = ref<HTMLIFrameElement | null>(null)
  const resizer = ref<IFrameObject | null>(null)
  const consoleGroup = createAutoConsoleGroup()

  function buildOptions(): any {
    return {
      ...Object.fromEntries(
        Object.entries(toRaw(props)).filter(([, value]) => value !== undefined),
      ),
      onBeforeClose: () => {
        consoleGroup.event('Blocked Close Event')
        consoleGroup.warn('Close method is disabled, use Vue to remove iframe')
        return false
      },
      onReady: (iframe: IFrameComponent) => emit('onReady', iframe),
      onMessage: (data: IFrameMessageData) => emit('onMessage', data),
      onResized: (data: IFrameResizedData) => emit('onResized', data),
    }
  }

  onMounted(() => {
    // Template refs are guaranteed populated before onMounted fires
    const iframe = iframeRef.value!
    const options = buildOptions()

    consoleGroup.label(`vue(${iframe.id})`)
    consoleGroup.event('setup')

    resizer.value = connectResizer(options)(iframe)

    consoleGroup.expand(props.log === EXPAND || props.log === LOG_EXPANDED)
    if ([COLLAPSE, EXPAND, true].includes(options.log as any)) {
      consoleGroup.log('Created Vue component')
    }
  })

  // Re-bind on prop changes; subsequent calls take the update path in core
  // and dispatch an UPDATE message to the child.
  watch(
    () => ({ ...toRaw(props) }),
    () => {
      const iframe = iframeRef.value
      if (!iframe) return
      connectResizer(buildOptions())(iframe)
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    resizer.value?.disconnect()
    consoleGroup.endAutoGroup()
  })

  defineExpose({
    moveToAnchor: (anchor: string) => resizer.value?.moveToAnchor(anchor),
    sendMessage: (msg: any, target?: string) =>
      resizer.value?.sendMessage(msg, target),
  })
</script>
