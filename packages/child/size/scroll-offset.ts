import { HEIGHT_EDGE } from '@iframe-resizer/common/consts'

// getBoundingClientRect() is relative to the viewport, so a scrolled page
// measures short by this much on the given side
const scrollOffset = (side: string): number =>
  side === HEIGHT_EDGE ? window.scrollY : window.scrollX

export default scrollOffset
