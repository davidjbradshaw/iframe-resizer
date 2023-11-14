## Vue2

Create the following Vue directive

```js
import Vue from 'vue'
import iframeResize from 'iframe-resizer/js/iframeResizer';

Vue.directive('resize', {
  bind: function(el, { value = {} }) {
    el.addEventListener('load', () => iframeResize(value, el))
  },
  unbind: function (el) {
    el.iFrameResizer.removeListeners();
  }
})
```

and then include it on your page as follows.

```html
<iframe
  v-resize="{ log: true }"
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
import iframeResize from 'iframe-resizer/js/iframeResizer'

interface ResizableHTMLElement extends HTMLElement {
    iFrameResizer?: {
        removeListeners: () => void
    }
}

const resize: Directive = {
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
app.directive('resize', iframeResize)
...
app.mount('#app')

```

and then include it on your page as follows.

```html
<iframe
  v-resize="{ log: true }"
  width="100%"
  src="myiframe.html"
  frameborder="0"
></iframe>
```

