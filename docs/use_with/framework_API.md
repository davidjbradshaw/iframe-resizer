## Creating your own framework component interface

The `@iframe-resizer/core` package provides a [High Order Function](https://eloquentjavascript.net/05_higher_order.html), that allows you to configure _iframe-resizer_ and then connect iframe HTMLElements one at a time. 

```js
  connectResizer(options)(iframe HTMLElement)
```

### Example component

The following is a simplified version of the jQuery plugin. This example first uses `connectResizer()` to create the function `connectWithOptions()`, that we can then use with jQuery's `each()` method after first filtering the array passed by jQuery to ensure it only contain iframes. Finally the `end()` method reverts the filter and passes the original element array back to jQuery.

```js
import connectResizer from '@iframe-resizer/core'

window.jQuery.fn.iframeResize = function (options) {
  const connectWithOptions = connectResizer(options)

  return this
    .filter('iframe')
    .each(connectWithOptions)
    .end()
}
```

The actual `@iframe-resizer/jquery` plugin provides a few more [safety checks]([http://gitgub.com/](https://github.com/davidjbradshaw/iframe-resizer/blob/master/src/jquery/plugin.js)) to help inexperinced users get up and running.

### connectResizer()() vs iframeResize()

The `connectResizer()()` function is used internally by `iframeResize()`, the main difference is that the later allows you to pass in any valid CSS Selector, an [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement), or simply not specify anything and it will hunt for iframes on the page, where as `connectResize()()` will only accept an iframe HTMLElement.

The return type for `connectResizer()()` is void, where as `iframeResizer()` returns a nodeList of the iframes it has found on your behalf. 


