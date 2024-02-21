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

### heightCalculationMethod / widthCalculationMethod

    default: null
    type: function() { return integer }

Add a custom function to calculate page size. Function must return size as an integer. This can be useful when none of the standard ways of working out the size provide a suitable result. However, normally problems with sizing are due to CSS issues and this should be looked at first.

### offsetHeight / offsetWidth

    default: 0
    type:    integer

Modify the computed size of the iframe. This is useful if the page in the iframe returns a size value that is consitantly slightly different to how you want the iframe to be sized.

### targetOrigin

	default: '*'
	type: string

This option allows you to restrict the domain of the parent page, to prevent other sites mimicking your parent page.
