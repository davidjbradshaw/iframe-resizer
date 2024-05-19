[<img src="https://iframe-resizer.com/logo-full.svg" alt="" title="" style="margin-bottom: -20px">](https://iframe-resizer.com)

[![npm version](https://badge.fury.io/js/@iframe-resizer%2Fparent.svg)](https://badge.fury.io/js/@iframe-resizer%2Fparent)
 <!--
[![NPM Downloads](https://img.shields.io/npm/dm/iframe-resizer.svg)](https://npm-stat.com/charts.html?package=iframe-resizer&from=2014-12-31)
[![](https://data.jsdelivr.com/v1/package/npm/iframe-resizer/badge?style=rounded)](https://www.jsdelivr.com/package/npm/iframe-resizer) 
[![Coverage Status](https://coveralls.io/repos/davidjbradshaw/iframe-resizer/badge.svg?branch=master&service=github)](https://coveralls.io/github/davidjbradshaw/iframe-resizer)
-->

This library enables the automatic resizing of the height and width of both same and cross domain iframes to fit their contained content and provides a range of features to address the most common issues with using iframes.

## Setup and API guide

Please see the [iframe-resizer](https://iframe-resizer.com) website for setup guides and API documentation.
<br><br>

## Main packages

For version 5 _iframe-resizer_ is split into two main packages to make it simpler to deploy across different domains and better support tree shaking.

### @iframe-resizer/parent

The page package sets up an iframe for automatic content resizing. Their are versions of this package for several popular libraries and frameworks (see below).

### @iframe-resizer/child

This package needs loading into the iframe, where it will quietly wait for a message from the parent page before initialising. It is designed to be a good guest on someone else site.
<br><br>

## Frameworks and Libraries

In addition to the two main packages, their are versions of the parent package for the following platforms.

### @iframe-resizer/react

A React component for the parent page ([setup guide](https://iframe-resizer.com/frameworks/react/)).

### @iframe-resizer/vue

Coming soon.

### @iframe-resizer/jquery

A simple jQuery wrapper for the parent page.([setup guide](https://iframe-resizer.com/frameworks/jquery/)).

### Wordpress

[Wordpress setup guide](https://iframe-resizer.com/frameworks/wordpress/).

### Google Apps Script

[GAS setup guide](https://iframe-resizer.com/frameworks/google_apps_script/).

---
Copyright &copy; 2013-24 [David J. Bradshaw](https://github.com/davidjbradshaw) -
Licensed under the [GPL V3](LICENSE)

