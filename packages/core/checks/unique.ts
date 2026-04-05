import { NEW_LINE } from '../../common/consts'
import { advise } from '../console'

const shownDuplicateIdWarning: Record<string, boolean> = {}

export default function checkUniqueId(id: string): boolean {
  if (shownDuplicateIdWarning[id] === true) return false

  const elements = document.querySelectorAll(`iframe#${CSS.escape(id)}`)
  if (elements.length <= 1) return true

  shownDuplicateIdWarning[id] = true

  const elementList = Array.from(elements).flatMap((element) => [
    NEW_LINE,
    element,
    NEW_LINE,
  ])

  advise(
    id,
    `<rb>Duplicate ID attributes detected</>

The <b>${id}</> ID is not unique. Having multiple iframes on the same page with the same ID causes problems with communication between the iframe and parent page. Please ensure that the ID of each iframe has a unique value.

Found <bb>${elements.length}</> iframes with the <b>${id}</> ID:`,
    ...elementList,
    NEW_LINE,
  )

  return false
}
