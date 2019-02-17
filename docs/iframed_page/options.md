## IFrame Page Options

The following options can be set from within the iFrame page by creating a `window.iFrameResizer` object before the JavaScript file is loaded into the page.

```html
<script>
  window.iFrameResizer = {
    targetOrigin: 'http://mydomain.com'
  }
</script>
<script src="js/iframeresizer.contentwindow.js"></script>
```

### targetOrigin

	default: '*'
	type: string

This option allows you to restrict the domain of the parent page, to prevent other sites mimicing your parent page.

### heightCalculationMethod / widthCalculationMethod

    default: null
    type: string | function() { return integer }

These options can be used to override the option set in the parent page (See above for details on available values). This can be useful when moving between pages in the iFrame that require different values for these options.

Altenatively you can pass a custom function that returns the size as an integer. This can be useful when none of the standard ways of working out the size are suitable. However, normally problems with sizing are due to CSS issues and this should be looked at first.
