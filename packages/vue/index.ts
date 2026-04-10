import type { App } from 'vue'

import IframeResizer from './iframe-resizer.vue'

export default {
  install(app: App) {
    app.component('IframeResizer', IframeResizer)
  },
}

export type {
  IframeComponent,
  IframeMessageData,
  IframeMouseData,
  IframeObject,
  IframeOptions,
  IframeResizedData,
  IframeScrollData,
} from '@iframe-resizer/core'
