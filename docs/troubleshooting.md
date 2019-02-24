## Troubleshooting

The first steps to investigate a problem is to make sure you are using the latest version and then enable the [log](#log) option, which outputs everything that happens to the [JavaScript Console](https://developers.google.com/chrome-developer-tools/docs/console#opening_the_console). This will enable you to see what both the iFrame and host page are up to and also see any JavaScript error messages.

Solutions for the most common problems are outlined in this section. If you need futher help, then please ask questions on [StackOverflow](http://stackoverflow.com/questions/tagged/iframe-resizer) with the `iframe-resizer` tag.

Bug reports and pull requests are welcome on the [issue tracker](https://github.com/davidjbradshaw/iframe-resizer/issues). Please read the [contributing guidelines](https://github.com/davidjbradshaw/iframe-resizer/blob/master/CONTRIBUTING.md) before openning a ticket, as this will ensure a faster resolution.

### Multiple IFrames on one page

When the resizer does not work using multiple IFrames on one page, make sure that each frame has an unique id or no ids at all.

### IFrame not sizing correctly

If a larger element of content is removed from the normal document flow, through the use of absolute positioning, it can prevent the browser working out the correct size of the page. In such cases you can change the [heightCalculationMethod](#heightcalculationmethod) to uses one of the other sizing methods.

### IFrame not downsizing

The most likely cause of this problem is having set the height of an element to be 100% of the page somewhere in your CSS. This is normally on the `html` or `body` elements, but it could be on any element in the page. This can sometimes be got around by using the `taggedElement` height calculation method and added a `data-iframe-height` attribute to the element that you want to define the bottom position of the page. You may find it useful to use `position: relative` on this element to define a bottom margin or allow space for a floating footer.

Not having a valid [HTML document type](http://en.wikipedia.org/wiki/Document_type_declaration) in the iFrame can also sometimes prevent downsizing. At it's most simplest this can be the following.

```html
<!DOCTYPE html>
```

### IFrame not resizing

The most common cause of this is not placing the [iframeResizer.contentWindow.min.js](https://raw.github.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.contentWindow.min.js) script inside the iFramed page. If the other page is on a domain outside your control and you can not add JavaScript to that page, then now is the time to give up all hope of ever getting the iFrame to size to the content. As it is impossible to work out the size of the contained page, without using JavaScript on both the parent and child pages.

### IFrame not detecting CSS :hover events

If your page resizes via CSS `:hover` events, these won't be detected by default. It is however possible to create `mouseover` and `mouseout` event listeners on the elements that are resized via CSS and have these events call the [parentIFrame.size()](##parentiframesize-customheight-customwidth) method. With jQuery this can be done as follows

```js
function resize(){
  if ('parentIFrame' in window) {
    // Fix race condition in FireFox with setTimeout
    setTimeout(parentIFrame.size.bind(parentIFrame),0);
  }
}

$(*Element with hover style*).hover(resize);
```

### IFrame not detecting textarea resizes

Both FireFox and the WebKit based browsers allow the user to resize `textarea` input boxes. Unfortunately the WebKit browsers don't trigger the mutation event when this happens. This can be worked around to some extent with the following code.

```js
function store() {
  this.x = this.offsetWidth
  this.y = this.offsetHeight
}

$('textarea')
  .each(store)
  .on('mouseover mouseout', function() {
    if (this.offsetWidth !== this.x || this.offsetHeight !== this.y) {
      store.call(this)
      if ('parentIFrame' in window) {
        parentIFrame.size()
      }
    }
  })
```

### IFrame flickers

Some of the alternate [height calculation methods](#heightcalculationmethod), such as **max** can cause the iFrame to flicker. This is due to the fact that to check for downsizing, the iFrame first has to be downsized before the new height can be worked out. This effect can be reduced by setting a [minSize](#minheight--minwidth) value, so that the iFrame is not reset to zero height before regrowing.

In modern browsers, if the default [height calculation method](#heightcalculationmethod) does not work, then it is normally best to use **taggedElement** or **lowestElement**, which are both flicker free.

<i>Please see the notes section under [heightCalculationMethod](#heightcalculationmethod) to understand the limitations of the different options.</i>

### ParentIFrame not found errors

The `parentIFrame` object is created once the iFrame has been initially resized. If you wish to use it during page load you will need call it from the onReady.

```html
<script>
  window.iFrameResizer = {
    onReady: function() {
      var myId = window.parentIFrame.getId()
      console.log('The ID of the iFrame in the parent page is: ' + myId)
    }
  }
</script>
<script src="js/iframeresizer.contentwindow.js"></script>
```

### PDF and OpenDocument files

It is not possible to add the required JavaScript to PDF and ODF files. However, you can get around this limitation by using [ViewerJS](http://viewerjs.org/) to render these files inside a HTML page, that also contains the iFrame JavaScript file ([iframeResizer.contentWindow.min.js](https://raw.github.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.contentWindow.min.js)).

### Unexpected message received error

By default the origin of incoming messages is checked against the `src` attribute of the iFrame. If they don't match an error is thrown. This behaviour can be disabled by setting the [checkOrigin](#checkorigin) option to **false**.

### Width not resizing

By default only changes in height are detected, if you want to calculate the width you need to set the `sizeWidth` opion to true and the `sizeHeight` option to false.
