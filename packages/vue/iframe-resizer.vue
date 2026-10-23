<template>
  <iframe ref="iframeRef" v-bind="$attrs"></iframe>
</template>

<script setup lang="ts">
  import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    toRaw,
    useAttrs,
    watch,
  } from 'vue'
  import type { PropType } from 'vue'
  import connectResizer from '@iframe-resizer/core'
  import type {
    IFrameComponent,
    IFrameLogOption,
    IFrameMessageData,
    IFrameMouseData,
    IFrameObject,
    IFrameResizedData,
    IFrameScrollData,
    IFrameScrollOption,
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
    // The types core takes, with Boolean first so a bare attribute is true
    bodyMargin: [String, Number],
    bodyPadding: [String, Number],
    checkOrigin: {
      type: [Boolean, Array] as PropType<boolean | string[]>,
      default: true,
    },
    direction: String,
    log: {
      // Boolean first, so Vue reads a bare `log` attribute as true, not ''
      type: [Boolean, String, Number] as PropType<IFrameLogOption>,
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
    scrolling: [Boolean, String] as PropType<IFrameScrollOption>,
    tolerance: Number,
    warningTimeout: Number,
  })

  const emit = defineEmits<{
    onReady: [iframe: IFrameComponent]
    onMessage: [data: IFrameMessageData]
    onResized: [data: IFrameResizedData]
    onScroll: [data: IFrameScrollData]
    onMouseEnter: [data: IFrameMouseData]
    onMouseLeave: [data: IFrameMouseData]
  }>()

  const iframeRef = ref<HTMLIFrameElement | null>(null)
  const resizer = ref<IFrameObject | null>(null)
  const consoleGroup = createAutoConsoleGroup()

  function buildOptions(): any {
    return {
      ...Object.fromEntries(
        Object.entries(toRaw(props)).filter(([, value]) => value !== undefined),
      ),
      // This component disconnects when it unmounts
      disconnectOnRemove: false,
      onBeforeClose: () => {
        consoleGroup.event('Blocked Close Event')
        consoleGroup.warn('Close method is disabled, use Vue to remove iframe')
        return false
      },
      onReady: (iframe: IFrameComponent) => emit('onReady', iframe),
      onMessage: (data: IFrameMessageData) => emit('onMessage', data),
      onResized: (data: IFrameResizedData) => emit('onResized', data),
      // An emit has no return value, so a scroll requested by the child
      // cannot be cancelled from the handler as it can with onScroll
      onScroll: (data: IFrameScrollData) => {
        emit('onScroll', data)
        return true
      },
      // Passing the mouse handlers enables mouse events in the child; whether
      // the page listens to them cannot be told here
      onMouseEnter: (data: IFrameMouseData) => emit('onMouseEnter', data),
      onMouseLeave: (data: IFrameMouseData) => emit('onMouseLeave', data),
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

  // Re-bind when a prop's value changes; later calls take core's update
  // path. Compare a key, as an array or object prop can be a new object
  // with the same value each time the parent renders. The id travels in
  // $attrs: a changed id re-binds, so core can report that a bound iframe
  // cannot change its id
  const attrs = useAttrs()
  const propsKey = computed(() => JSON.stringify([attrs.id, props]))

  // After the DOM updates, so a changed id is on the iframe before core reads
  // it: watchers are pre-flush by default, which would re-bind with the old id
  watch(
    propsKey,
    () => {
      const iframe = iframeRef.value
      if (!iframe) return
      connectResizer(buildOptions())(iframe)
    },
    { flush: 'post' },
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
