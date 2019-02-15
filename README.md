# iFrame Resizer
[![NPM version](https://badge.fury.io/js/iframe-resizer.svg)](http://badge.fury.io/js/iframe-resizer)
[![NPM Downloads](https://img.shields.io/npm/dm/iframe-resizer.svg)](https://npm-stat.com/charts.html?package=iframe-resizer&from=2015-09-01)
[![](https://data.jsdelivr.com/v1/package/npm/iframe-resizer/badge?style=rounded)](https://www.jsdelivr.com/package/npm/iframe-resizer) <!--
[![Build Status](https://travis-ci.org/davidjbradshaw/iframe-resizer.svg?branch=master)](https://travis-ci.org/davidjbradshaw/iframe-resizer)
[![Known Vulnerabilities](https://snyk.io/test/github/davidjbradshaw/iframe-resizer/badge.svg)](https://snyk.io/test/github/davidjbradshaw/iframe-resizer)
-->[![Coverage Status](https://coveralls.io/repos/davidjbradshaw/iframe-resizer/badge.svg?branch=master&service=github)](https://coveralls.io/github/davidjbradshaw/iframe-resizer)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.me/davidjbradshaw)

This library enables the automatic resizing of the height and width of both same and cross domain iFrames to fit their contained content. It provides a range of features to address the most common issues with using iFrames, these include:

* Height and width resizing of the iFrame to content size.
* Works with multiple and nested iFrames.
* Domain authentication for cross domain iFrames.
* Provides a range of page size calculation methods to support complex CSS layouts.
* Detects changes to the DOM that can cause the page to resize using [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver).
* Detects events that can cause the page to resize (Window Resize, CSS Animation and Transition, Orientation Change and Mouse events).
* Simplified messaging between iFrame and host page via [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage).
* Fixes in page links in iFrame and supports links between the iFrame and parent page.
* Provides custom sizing and scrolling methods.
* Exposes parent position and viewport size to the iFrame.
* Works with [ViewerJS](http://viewerjs.org/) to support PDF and ODF documents.
* Supports IE 11 (V3 supports back to IE8)

## Documentation



## License
Copyright &copy; 2013-19 [David J. Bradshaw](https://github.com/davidjbradshaw).
Licensed under the [MIT License](LICENSE).

[![NPM](https://nodei.co/npm/iframe-resizer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/iframe-resizer/) [![Greenkeeper badge](https://badges.greenkeeper.io/davidjbradshaw/iframe-resizer.svg)](https://greenkeeper.io/)
