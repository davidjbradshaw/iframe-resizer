import { getOrigin } from '@iframe-resizer/common'

// Whether a list of target origins allows a page's origin, as postMessage
// sees it, so an entry written as a URL matches its origin
const isAllowedOrigin = (targetOrigin: string[], origin: string): boolean =>
  targetOrigin.some((target) => target === '*' || getOrigin(target) === origin)

export default isAllowedOrigin
