iframe-resizer
--------------

This is a simple plugin to enable the resizing of cross domain iframes to fit the contained content. This package contains two minified JavaScript files the <a href="js">js</a> folder. The first (<a href="jquery.iframeResizer.min.js">jquery.iframeResizer.min.js</a>) is a jQuery plugin for the page hosting the iframe and the second one (<a href="iframeResizer.contentWindow.min.js">iframeResizer.contentWindow.min.js</a>) is a plain self contained JavaScript file that needs placing in the page contained in your iframe.

This plugin is built using the <a href="https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage">window.postMessage API</a> to pass messages between the host page and the iframe. To see this working take a look at the <a href="example/index.html">example</a> and watch the console log.

 The code supports resizing the iframe when the browser window changes size or the content of the iframe changes. For this to work you need to set one of the dimensions to a percentage and tell the plugin only to update the other dimension. Normally you would set the width to 100% and have the height scale to fit the content. To set the plugin up for this create an basic iframe tag with the following options.

`<iframe src="http://anotherdomain.com/frame.content.html" width="100%" scrolling="no"></iframe>`

Note that scrolling is set to no, as older versions of IE don't allow this to be turned off in code and can just slightly add a bit of extra space to the bottom of the content that it doesn't report when it returns the height.

Next we initialise the plugin on the host page. This example shows all the default options and the values returned to the callback function.

	$('iframe').iFrameSizer({
				log: false,
				contentWindowBodyMargin:8,
				doHeight:true,
				doWidth:false,
				callback:function(messageData){
					$('p#callback').html('<b>Frame ID:</b> ' + messageData.iframe.id + 
										' <b>Height:</b> ' + messageData.height + 
										' <b>Width:</b> ' + messageData.width);
				}
			});

The `contentWindowBodyMagin` setting is used to override the default browser body tag style. As we can not reliably read this value and it's not included in the figure returned by `document.body.offsetHeight`. So the only way we can reliable work this out is to set it, 8px is the default option in firefox. However, you will most likely want to set this to zero so that the content of you iframe is at the edge of the iframe.

Setting the `log` option to true will make the scripts in both the host page and the iframe output everything they do to the JavaScript console so you can see the communication between the two scripts.
