import { hasOwn } from '@iframe-resizer/common'

import settings from '../values/settings'

// Core keeps an iframe's settings under the id it was bound with, and the
// child tags every message with that id, so a bound iframe cannot change it
export default function checkBoundId(iframe: HTMLIFrameElement): void {
  const { id } = iframe
  if (hasOwn(settings, id)) return

  const boundId = Object.keys(settings).find(
    (key) => settings[key].iframe === iframe,
  )

  throw new ReferenceError(
    `The id of a bound iframe cannot be changed, from "${boundId}" to "${id}". To use a new id, remove the iframe and add a new one.`,
  )
}
