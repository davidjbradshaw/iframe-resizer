## Packages

For version 5 _iframe-resizer_ is split into two main packages to make it simpler to deploy across different domains and better support tree shaking. These two packages can be installed from NPM, or [downloaded](https://github.com/davidjbradshaw/iframe-resizer/raw/master/iframe-resizer.zip) as a zip file.

### [@iframe-resizer/parent](https://www.npmjs.com/package/@iframe-resizer/parent)

The parent page package sets up an iframe for automatic content resizing. Their are versions of this package for several popular libraries and frameworks (see below).

### [@iframe-resizer/child](https://www.npmjs.com/package/@iframe-resizer/child)

This package needs loading into the iframe, where it will quietly wait for a message from the parent page before initialising. It is designed to be a good guest on someone else site.


## Frameworks and Libraries

In addition to the two main packages, their are versions of the parent package for the following platforms.

### [@iframe-resizer/react](https://www.npmjs.com/package/@iframe-resizer/react)

A **React** component for the parent page.

### [@iframe-resizer/vue](https://www.npmjs.com/package/@iframe-resizer/vue)

A **Vue** component for the parent page.

### [@iframe-resizer/jquery](https://www.npmjs.com/package/@iframe-resizer/jquery)

A simple **jQuery** wrapper for the parent page.


## API

### [@iframe-resizer/core](https://www.npmjs.com/package/@iframe-resizer/core)

The core API for the parent page, used by `@iframe-resizer/parent`, plus the framework and library component versions.

---
Copyright &copy; 2013-24 [David J. Bradshaw](https://github.com/davidjbradshaw) - Licensed under the [GPL V3](LICENSE)
