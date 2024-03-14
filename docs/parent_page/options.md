## Options

The following options can be passed to iframe-resizer on the parent page.

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

### direction

    default: 'horizontal'
	values: 'horizontal' || 'vertical' || 'none'

Set the direction in which you want the iframe to automaticaly scale to the content size.

### inPageLinks

	default: false
	type:    boolean

When enabled in page linking inside the iFrame and from the iFrame to the parent page will be enabled.

<!--
### maxHeight / maxWidth

    default: infinity
    type:    integer

Set maximum height/width of iFrame.

### minHeight / minWidth

    default: 0
    type:    integer

Set minimum height/width of iFrame. -->

### offsetHeight / offsetWidth

    default: 0
    type:    integer

Modify the computed size of the iframe. This is useful if the page in the iframe returns a size value that is consitantly slightly different to how you want the iframe to be sized.

<sup>*</sup> This value can also be set on a per page basis in the iframe.

### scrolling

    default: false
    type:    boolean | 'omit'

Enable scroll bars in iFrame.

* **true** applies `scrolling="yes"`
* **false** applies `scrolling="no"`
* **'omit'** applies no `scrolling` attribute to the iFrame

### tolerance

	default: 0
	type:    integer

Set the number of pixels the iFrame content size has to change by, before triggering a resize of the iFrame.

### warningTimeout

	default: 5000
	type:    integer

Set the number of milliseconds after which a warning is logged if the iFrame has not responded. Set to `0` to supress warning messages of this type.
