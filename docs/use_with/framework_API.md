## Creating your own framework interface

The `@iframe-resizer/core` package provides a [High Order Function](https://eloquentjavascript.net/05_higher_order.html), that allows you to configure _iframe-resizer_ and connect a single iframe.

```js
  connectResizer(options)(iframe)
```

As an example here is a simplified version of the jQuery plugin. 

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

This plugin first uses `connectResizer()` to create the function `connectWithOptions()`, that we can then use with jQuery's `each()` method after first filtering the array passed by jQuery to only contain iframes. Finally the `end()` method reverts the filter and passes the original element array back to jQuery.
