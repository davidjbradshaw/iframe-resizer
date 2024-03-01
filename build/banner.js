import pkg from '../package.json' with { type: "json" }

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const year = new Date().getFullYear()

const createBanner =  (file) => `/**
 *  iframe-resizer (${file}) v${pkg.version}
 *
 *  License:    ${pkg.license}
 *  Copyright:  (c) 2013 - ${year}, David J. Bradshaw. All rights reserved.
 * 
 *  Desciption: Keep same and cross domain iFrames sized to their content with
 *              support for window/content resizing, and multiple iFrames.
 *
 *  @preserve
 *  @module @iframe-resizer/${file.toLowerCase()}
 *  @version ${pkg.version}
 *  @license ${pkg.license}
 *  @author ${pkg.author.name} <${pkg.author.email}>
 *  @fileoverview ${capitalizeFirstLetter(file)}${file === 'jQuery' ? ' parent' : ''} window script for iframe-resizer.
 *  @copyright (c) 2013 - ${year}, ${pkg.author.name}. All rights reserved.
 *  @see {@link ${pkg.homepage}}
 */

`

export default {
    parent: createBanner('parent'),
    child: createBanner('child'),
    jQuery: createBanner('jQuery'),
}

