## Google Apps Script

The [Google Apps Script](https://www.google.com/script/start/) platform creates a nested iframe between your app and the page it is host on. This creates a unique challenge for _iFrame Resizer_, as it needs to be able to talk directly with the iframe it is using to calculate the page size from.

This can be overcome by providing _iFrame Resizer_ some hints on where it can fimd the nested iframe, in order to establlish communication between the parent page and the GAS iframe.

### iFrame

The first step is to add the following line of code into your GAS application. This will send a message to the parent page when your application loads that contains details of where the iframe is located.

```html
  top.postMessage('gasFrame', '*')
```

### Parent Page

The parent page needs to wait to recieve the above message before starting _iFrame Resizer_. Once recieved the contained referrences from the GAS application iframe, can be passed along to _iFrame Resizer_ as follows.

```js
window.addEventListener("message", (event) => {
  if (event.data === 'gasFrame') {
    iframeResize({
      checkOrigin: event.origin,
      offsetHeight: 19,
      postMessageTarget: event.source
    }, '#myGasIframe')
  }
}, false)
```

The value for `offsetHeight` may need to be adjusted based on the content of your GAS application.
