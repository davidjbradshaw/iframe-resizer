## Google Apps Script

The [Google Apps Script](https://www.google.com/script/start/) platform creates a nested iframe between your app and the page it is host on. This creates a unique challenge for **iframe-resizer**, as it needs to be able to talk with the iframe it is using to calculate the page size from.

This can be overcome by providing **iframe-resizer** some hints on where it needs send messages to communicate between the parent page and the iframe.

### iframe

The first step is to add the following line of code into your GAS application. This will send a message to the parent page, that we can then pass the detials of to **iframe-resizer**.

```html
  top.postMessage('gasFrame', '*')
```

### Parent Page

The parent page needs to wait to recieve the above message before starting **iframe-resize** and then pass it the recieved referrences to the application iframe.

```js
window.addEventListener("message", (event) => {
  if (event.data === 'gasFrame') {
    iframeResize({
      log: true,
      checkOrigin: event.origin,
      offsetHeight: 20,
      postMessageTarget: event.source
    }, '#myGasIframe')
  }
}, false)
```

The value for `offsetHeight` may need to be adjusted based on the content of your iframe.
