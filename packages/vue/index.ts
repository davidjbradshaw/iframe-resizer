import type { App } from 'vue'
import IframeResizer from './iframe-resizer.vue'

export default {
  install(app: App) {
    app.component('IframeResizer', IframeResizer)
  },
}
