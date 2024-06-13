[<img src="https://iframe-resizer.com/logo-full.svg" alt="" title="" style="margin-bottom: -20px">](https://iframe-resizer.com)

[![npm version](https://badge.fury.io/js/@iframe-resizer%2Fcore.svg)](https://badge.fury.io/js/@iframe-resizer%2Fparent)
 <!--
[![NPM Downloads](https://img.shields.io/npm/dm/iframe-resizer.svg)](https://npm-stat.com/charts.html?package=iframe-resizer&from=2014-12-31)
[![](https://data.jsdelivr.com/v1/package/npm/iframe-resizer/badge?style=rounded)](https://www.jsdelivr.com/package/npm/iframe-resizer) 

-->

## Introduction

The _[iframe-resizer](https://iframe-resizer.com)_ library aims to take away the pain points with using iframes. It will resize your iframe to match the size of your content and then monitor the iframe to ensure that it is always the perfect size.

As browsers don’t provide a single consistently reliable method to calculate content size, _iframe-resizer_ automatically inspects your page and selects the best value for your content every time it detects something changed.

Supports both internal (same-domain) and external (cross-domain) iframes via a simple JS file that is designed to be a zero impact guest on the sites hosting it.

### Extended API

Additionally _iframe-resizer_ provides a range of missing browser API features, that allows you to securely integrate your iframe content with the parent page.

* Scroll the page, relative to the iframe or parent page’s position
* Get details of the position of the iframe, the scroll position and viewport of the parent page
* Fixes in page linking in the iframe and allows links to propagate to the parent page
* Adds onMouseEnter and onMouseLeave events to the iframe element
* Simplified message passing between the iframe and the parent page
* Automatic domain authentication

When combined with [viewer.js](https://viewerjs.org/) it can even resize iframes containing PDF and ODF documents.

### Setup and API guide

Please see the _[iframe-resizer](https://iframe-resizer.com)_ website for setup guides and API documentation. This includes versions for:

* Vanilla JS
* React
* Vue
* jQuery

Along with setup guides for:
  
* Wordpress
* Google Apps Script

Their is also an [API](https://iframe-resizer.com/frameworks/api/) to support the creation of additional custom components.

### Version 5

This version of iframe-resizer has been extensively rewritten to use modern browser APIs, this has enabled significantly better performance and greater accuracy in the detection of content resizing events.

With this release, the opportunity has been taken to refresh and simplify the API, if you are coming from a previous version then their is an [Upgrade Guide](https://iframe-resizer.com/upgrade) to explain the changes.

## Main packages

For version 5 _iframe-resizer_ is split into two main packages to make it simpler to deploy across different domains and better support tree shaking. These two packages can be installed from NPM, or [downloaded](https://github.com/davidjbradshaw/iframe-resizer/raw/master/iframe-resizer.zip) as a zip file.

### [@iframe-resizer/parent](https://iframe-resizer.com/setup/#parent-page-setup)

The parent page package sets up an iframe for automatic content resizing. Their are versions of this package for several popular libraries and frameworks (see below).

### [@iframe-resizer/child](https://iframe-resizer.com/setup/#child-page-setup)

This package needs loading into the iframe, where it will quietly wait for a message from the parent page before initialising. It is designed to be a good guest on someone else site.


## Frameworks and Libraries

In addition to the two main packages, their are versions of the parent package for the following platforms.

### [@iframe-resizer/react](https://iframe-resizer.com/frameworks/react/)

A **React** component for the parent page.

### [@iframe-resizer/vue](https://iframe-resizer.com/vue)

A **Vue** component for the parent page.

### [@iframe-resizer/jquery](https://iframe-resizer.com/frameworks/jquery/)

A simple **jQuery** wrapper for the parent page.

## Platform Guides

Guides for using _iframe-resizer_ on different web development platforms.

### Wordpress

[Wordpress setup guide](https://iframe-resizer.com/guides/wordpress/).

### Google Apps Script

[GAS setup guide](https://iframe-resizer.com/guides/google_apps_script/).

## Framework API

Their is also an [API](https://iframe-resizer.com/frameworks/api/) to support the creation of additional custom components.

---
Copyright &copy; 2013-24 [David J. Bradshaw](https://github.com/davidjbradshaw) -Licensed under the [GPL V3](LICENSE)

