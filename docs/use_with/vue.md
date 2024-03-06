## Vue2

Create the following Vue directive

```js
import Vue from 'vue'
import connectResizer from '@iframe-resizer/core'

Vue.directive('resizer', {
  bind: function(el, { value = {} }) {
    connectResizer(value)(el)
  },
  unbind: function (el) {
    el.iFrameResizer.removeListeners()
  }
})
```

and then include it on your page as follows.

```html
<iframe
  v-resizer
  width="100%"
  src="myiframe.html"
  frameborder="0"
></iframe>
```

- Thanks to [Aldebaran Desombergh](https://github.com/davidjbradshaw/iframe-resizer/issues/513#issuecomment-538333854) for this example

## Vue3 (with Typescript)

Create the following Vue directive (EG `utils/directives/iframeResize.ts`)

```ts
import { Directive, DirectiveBinding } from 'vue'
import connectResizer from '@iframe-resizer/core'

interface ResizableHTMLElement extends HTMLElement {
    iFrameResizer?: {
        removeListeners: () => void
    }
}

const resizer: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const options = binding.value || {}
    el.addEventListener('load', () => iframeResize(options, el))
  },
  unmounted(el: HTMLElement) {
    const resizableEl = el as ResizableHTMLElement

    if (resizableEl.iFrameResizer) {
      resizableEl.iFrameResizer.removeListeners()
    }
  },
}

export default resize
```

Register the directive
```ts
const app = createApp(App)
...
app.directive('resizer', connectResizer)
...
app.mount('#app')

```

and then include it on your page as follows.

```html
<iframe
  v-resizer
  width="100%"
  src="myiframe.html"
  frameborder="0"
></iframe>
```

