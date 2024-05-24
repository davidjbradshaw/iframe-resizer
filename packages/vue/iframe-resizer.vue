<template>
  <div ref='IframeResizer'>
    <slot></slot>
  </div>
</template>

<script lang="ts">
  // Rollup-plug-vue blows up with the types included!

  import connectResizer from '@iframe-resizer/core'
  // import { Directive, DirectiveBinding } from 'vue'

  // interface ResizableHTMLElement extends HTMLElement {
  //   iframeResizer?: {
  //     moveToAnchor: (string) => void
  //     resize: (x: number, y: number) => void
  //     sendMessage: (string) => void
  //   }
  // }

  const iframeResizer /* : Directive */ = {
    mounted(el /* : HTMLElement */, binding /*: DirectiveBinding */) {
      const options = binding.value || {}
      const connectWithOptions = connectResizer(options)
      el.addEventListener('load', () => connectWithOptions(el))
    },
    unmounted(el /*: HTMLElement */) {
      const resizableEl = el /* as ResizableHTMLElement */
      resizableEl?.iframeResizer.disconnect()
    },
  }

  export default resize

</script>
