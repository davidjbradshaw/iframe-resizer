import pkg from '../package.json' with { type: "json" }

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const date = new Date()
const year = date.getFullYear()
const today = date.toISOString().split('T')[0]

export default (file, type) => `/**
 *  iframe-resizer (${file}) v${pkg.version} (${type}) - ${today}
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



