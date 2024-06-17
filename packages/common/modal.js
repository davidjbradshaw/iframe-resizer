/* This function is only called if no license key is provided.
 * Doing it this way rather than importing the script directly
 * to avoid bundling as it should never be needed in production.
 *
 * This reduces the bundle size by 16%
 *
 * I've thought long and hard about doing it this way and I
 * welcome feedback on this approach.
 *
 */

import { once } from './utils'

// Show licensing modal
export default once(() => {
  const script = document.createElement('script')
  script.async = true
  script.src =
    // https://github.com/iframe-resizer/modal
    '//cdn.jsdelivr.net/gh/iframe-resizer/modal/iframe-resizer.modal.js'
  document.head.append(script)
})
