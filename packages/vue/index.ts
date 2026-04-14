import type { App } from 'vue'

import IframeResizer from './iframe-resizer.vue'

export default {
  install(app: App) {
    app.component('IframeResizer', IframeResizer)
  },
}

export type {
  IframeComponent,
  IframeDirection,
  IframeLogOption,
  IframeMessageData,
  IframeMouseData,
  IframeObject,
  IframeOptions,
  IframeResizedData,
  IframeScrollData,
  IframeScrollOption,
} from '@iframe-resizer/core'
