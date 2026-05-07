import {
  LEGACY_SIZE_ATTR,
  NEW_LINE,
  SIZE_ATTR,
} from '@iframe-resizer/common/consts'

import { warn } from '../console'

export default function migrateLegacySizeAttr(): void {
  const elements = document.querySelectorAll(`[${LEGACY_SIZE_ATTR}]`)
  if (elements.length === 0) return

  for (const el of elements) {
    el.removeAttribute(LEGACY_SIZE_ATTR)
    el.toggleAttribute(SIZE_ATTR, true)
  }

  warn(
    `Renamed deprecated ${LEGACY_SIZE_ATTR} attribute to ${SIZE_ATTR} on ${elements.length} element${elements.length === 1 ? '' : 's'}:`,
    ...Array.from(elements).flatMap((el) => [NEW_LINE, el]),
  )
}
