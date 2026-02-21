import pkg from '../package.json' with { type: 'json' }

const date = new Date()
const year = date.getFullYear()
const today = date.toISOString().split('T')[0]

export default (file, type) => `/*!
 *  @preserve
 *
 *  @module      iframe-resizer/${file} ${pkg.version} (${type}) ${type === 'iife' ? '' : `- ${today}`}
 *
 *  @license     ${pkg.license} For use with GPL compliant sites (fully published front & backend source code)
 *               Alternatively for commercial use, you can purchase a license from
 *               ${pkg.homepage}/pricing
 *
 *  @description Keep same and cross domain iFrames sized to their content
 *
 *  @author      ${pkg.author.name} <${pkg.author.email}>
 *
 *  @see         {@link ${pkg.homepage}}
 *
 *  @copyright  (c) 2013 - ${year}, ${pkg.author.name}. All rights reserved.
 */

`
