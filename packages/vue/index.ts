import type { App } from 'vue'

import IframeResizer from './iframe-resizer.vue'

export default {
  install(app: App) {
    app.component('IframeResizer', IframeResizer)
  },
}

export type {
  IFrameComponent,
  IFrameDirection,
  IFrameLogOption,
  IFrameMessageData,
  IFrameMouseData,
  IFrameObject,
  IFrameOptions,
  IFrameResizedData,
  IFrameScrollData,
  IFrameScrollOption,
} from '@iframe-resizer/core'
