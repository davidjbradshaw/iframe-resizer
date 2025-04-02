[<img src="https://iframe-resizer.com/logo-full.svg" alt="" title="" style="margin-bottom: -20px">](https://iframe-resizer.com)

[![npm version](https://badge.fury.io/js/@iframe-resizer%2Fcore.svg)](https://badge.fury.io/js/@iframe-resizer%2Fparent)
 <!--
[![NPM Downloads](https://img.shields.io/npm/dm/iframe-resizer.svg)](https://npm-stat.com/charts.html?package=iframe-resizer&from=2014-12-31)
[![](https://data.jsdelivr.com/v1/package/npm/iframe-resizer/badge?style=rounded)](https://www.jsdelivr.com/package/npm/iframe-resizer) 

-->

## Introduction

The _[iframe-resizer](https://iframe-resizer.com)_ library aims to take away the pain
points with using iframes. It will resize your iframe to match the size of your content
and then monitor the iframe to ensure that it is always the perfect size.

### Reliable Resizing

As browsers don't provide a single consistently reliable method to calculate content
size, _iframe-resizer_ automatically inspects your page and selects the best value
for your content every time it detects something changed.

### Cross Domain

Supports both internal (same-domain) and external (cross-domain) iframes via a simple
JS file that is designed to be a zero impact guest on the sites hosting it.

### Lightening Performance

To ensure minimal impact on your site, _iframe-resizer_ is highly optimised and
utilizes _[Set Theory](https://en.wikipedia.org/wiki/Set_theory)_ to ensure it only
checks the page elements that effect the sizing of your iframes.

Even on the most complex pages, _iframe-resizer_ can detect changes to both HTML
and CSS, calculate the revised content dimensions and update the iframe in sub
millisecond time.

### Setup

Please see the **_[iframe-resizer](https://iframe-resizer.com)_** website for setup guides
and API documentation. This includes versions for:

* **[Vanilla JS](https://iframe-resizer.com/setup)**
* **[React](https://iframe-resizer.com/frameworks/react)**
* **[Vue](https://iframe-resizer.com/frameworks/vue3)**
* **[Angular](https://iframe-resizer.com/frameworks/angular)**
* **[jQuery](https://iframe-resizer.com/frameworks/jquery)**

Along with setup guides for:
  
* **[Wordpress](https://iframe-resizer.com/guides/wordpress/)**
* **[Google Apps Script](https://iframe-resizer.com/guides/google_apps_script)**

Their is also an [API](https://iframe-resizer.com/frameworks/api/) to support the creation
of additional custom components.

### Extended API

Additionally _iframe-resizer_ provides a range of missing browser API features, that allows you to securely integrate your iframe content with the parent page.

- Scroll the parent page, [relative to the iframe](https://iframe-resizer.com/api/child#scrolltooffsetx-y) or [parent page's position](https://iframe-resizer.com/api/child#scrollbyx-y)
- Provides details of the [position of the iframe](https://iframe-resizer.com/api/child#getparentpropscallback), the [scroll position](https://iframe-resizer.com/api/child#getparentpropscallback) and [viewport](https://iframe-resizer.com/api/child#getparentpropscallback) of the parent page
- Fixes [in page linking](https://iframe-resizer.com/api/parent#inpagelinks) in the iframe and allows links to propagate to the parent page
- Adds [`onMouseEnter`](https://iframe-resizer.com/api/parent#onmouseenter) and [`onMouseLeave`](https://iframe-resizer.com/api/parent#onmouseleave) events to the iframe element
- Simplified message passing between the [iframe](https://iframe-resizer.com/api/child#onmessage) and the [parent](https://iframe-resizer.com/api/parent#onmessage) page
- Automatic domain authentication
- Enhanced [Accessibility](https://iframe-resizer.com/accessibility)

When combined with [viewer.js](https://viewerjs.org/) it can even resize iframes containing PDF and ODF documents.

## Version 5

This version of iframe-resizer has been extensively rewritten to use modern browser APIs, this has enabled significantly better performance and greater accuracy in the detection of content resizing events.

With this release, the opportunity has been taken to refresh and simplify the API, if you are coming from a previous version then their is an [Upgrade Guide](https://iframe-resizer.com/upgrade) to explain the changes.

---
Copyright &copy; 2013-25 [David J. Bradshaw](https://github.com/davidjbradshaw) - Licensed under the [GPL V3](LICENSE)
