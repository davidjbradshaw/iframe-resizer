import IframeResizer from './iframe-resizer.vue'

// Duck-typed interface compatible with both Vue 2 and Vue 3
interface VueApp {
  component: (name: string, component: any) => void
}

export default {
  install(app: VueApp) {
    app.component('IframeResizer', IframeResizer)
  },
}
