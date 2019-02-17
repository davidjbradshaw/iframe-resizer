
## Options

The following options can be passed to iframe-resizer on the parent page.

### log

	default: false
	type:    boolean

Setting the `log` option to true will make the scripts in both the host page and the iFrame output everything they do to the JavaScript console so you can see the communication between the two scripts.

### autoResize

	default: true
	type:    boolean

When enabled changes to the Window size or the DOM will cause the iFrame to resize to the new content size. Disable if using size method with custom dimensions.

<i>Note: When set to false the iFrame will still inititally size to the contained content, only additional resizing events are disabled.</i>

### bodyBackground

	default: null
	type:    string

Override the body background style in the iFrame.

### bodyMargin

	default: null
	type:    string || number

Override the default body margin style in the iFrame. A string can be any valid value for the CSS margin attribute, for example '8px 3em'. A number value is converted into px.

### bodyPadding

	default: null
	type:    string || number

Override the default body padding style in the iFrame. A string can be any valid value for the CSS margin attribute, for example '8px 3em'. A number value is converted into px.

### checkOrigin

	default: true
	type:    boolean || array

When set to true, only allow incoming messages from the domain listed in the `src` property of the iFrame tag. If your iFrame navigates between different domains, ports or protocols; then you will need to provide an array of URLs or disable this option.

### inPageLinks

	default: false
	type:    boolean

When enabled in page linking inside the iFrame and from the iFrame to the parent page will be enabled.

### heightCalculationMethod

    default: 'bodyOffset'
    values:  'bodyOffset' | 'bodyScroll' | 'documentElementOffset' | 'documentElementScroll' |
             'max' | 'min' | 'grow' | 'lowestElement' | 'taggedElement'

By default the height of the iFrame is calculated by converting the margin of the `body` to <i>px</i> and then adding the top and bottom figures to the offsetHeight of the `body` tag.

In cases where CSS styles causes the content to flow outside the `body` you may need to change this setting to one of the following options. Each can give different values depending on how CSS is used in the page and each has varying side-effects. You will need to experiment to see which is best for any particular circumstance.

* **bodyOffset** uses `document.body.offsetHeight`
* **bodyScroll** uses `document.body.scrollHeight` <sup>*</sup>
* **documentElementOffset** uses `document.documentElement.offsetHeight`
* **documentElementScroll** uses `document.documentElement.scrollHeight` <sup>*</sup>
* **max** takes the largest value of the main four options <sup>*</sup>
* **min** takes the smallest value of the main four options <sup>*</sup>
* **lowestElement** Loops though every element in the the DOM and finds the lowest bottom point <sup>†</sup>
* **taggedElement** Finds the bottom of the lowest element with a `data-iframe-height` attribute

<i>Notes:</i>

<i>**If the default option doesn't work then the best solutions is to use either** taggedElement, **or** lowestElement</i>**.** Alternatively it is possible to add your own custom sizing method directly inside the iFrame, see the [iFrame Page Options](../iframed_page/options.md) section for more details.

<sup> † </sup> <i>The **lowestElement** option is the most reliable way of determining the page height. However, it does have a performance impact, as it requires checking the position of every element on the page. The **taggedElement** option provides much greater performance by limiting the number of elements that need their position checked</i>.

<sup>*</sup> These methods can cause screen flicker in some browsers.

### maxHeight / maxWidth

    default: infinity
    type:    integer

Set maximum height/width of iFrame.

### minHeight / minWidth

    default: 0
    type:    integer

Set minimum height/width of iFrame.

### resizeFrom

    default: 'parent'
    values: 'parent', 'child'

Listen for resize events from the parent page, or the iFrame. Select the 'child' value if the iFrame can be resized independently of the browser window. <i>Selecting this value can cause issues with some height calculation methods on mobile devices</i>.

### scrolling

    default: false
    type:    boolean | 'omit'

Enable scroll bars in iFrame.

* **true** applies `scrolling="yes"`
* **false** applies `scrolling="no"`
* **'omit'** applies no `scrolling` attribute to the iFrame

### sizeHeight

	default: true
	type:    boolean

Resize iFrame to content height.

### sizeWidth

	default: false
	type:    boolean

Resize iFrame to content width.


### tolerance

	default: 0
	type:    integer

Set the number of pixels the iFrame content size has to change by, before triggering a resize of the iFrame.

### widthCalculationMethod

    default: 'scroll'
    values:  'bodyOffset' | 'bodyScroll' | 'documentElementOffset' | 'documentElementScroll' |
             'max' | 'min' | 'scroll' | 'rightMostElement' | 'taggedElement'

By default the width of the page is worked out by taking the greater of the **documentElement** and **body** scrollWidth values.

Some CSS techniques may require you to change this setting to one of the following options. Each can give different values depending on how CSS is used in the page and each has varying side-effects. You will need to experiment to see which is best for any particular circumstance.

* **bodyOffset** uses `document.body.offsetWidth`
* **bodyScroll** uses `document.body.scrollWidth` <sup>*</sup>
* **documentElementOffset** uses `document.documentElement.offsetWidth`
* **documentElementScroll** uses `document.documentElement.scrollWidth` <sup>*</sup>
* **scroll** takes the largest value of the two scroll options <sup>*</sup>
* **max** takes the largest value of the main four options <sup>*</sup>
* **min** takes the smallest value of the main four options <sup>*</sup>
* **rightMostElement** Loops though every element in the the DOM and finds the right most point <sup>†</sup>
* **taggedElement** Finds the left most element with a `data-iframe-width` attribute

Alternatively it is possible to add your own custom sizing method directly inside the iFrame, see the [iFrame Page Options](../iframed_page/options.md) section for more details

<sup> † </sup> <i>The **rightMostElement** option is the most reliable way of determining the page width. However, it does have a performance impact as it requires calculating the position of every element on the page. The **taggedElement** option provides much greater performance by limiting the number of elements that need their position checked.</i>

<sup>*</sup> These methods can cause screen flicker in some browsers.
