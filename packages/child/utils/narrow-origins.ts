import { getOrigin } from '@iframe-resizer/common'

// Once the window's origin is known, post only to the entry of the list that
// matches it. An entry written as a URL matches its origin, as in postMessage
const narrowOrigins = (
  origins: string | string[],
  origin?: string,
): string[] => {
  if (!Array.isArray(origins)) return [origins]

  const match =
    origin &&
    origins.find((entry) => entry !== '*' && getOrigin(entry) === origin)

  return match ? [match] : origins
}

export default narrowOrigins
