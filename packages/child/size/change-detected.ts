import checkTolerance from '../check/tolerance'
import settings from '../values/settings'
import state from '../values/state'

export default function isSizeChangeDetected(newHeight: number, newWidth: number): boolean {
  const { calculateHeight, calculateWidth } = settings
  const { height, width } = state

  return (
    (calculateHeight && checkTolerance(height, newHeight)) ||
    (calculateWidth && checkTolerance(width, newWidth))
  )
}
