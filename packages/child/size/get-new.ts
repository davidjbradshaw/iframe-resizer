import { MIN_SIZE } from '../../common/consts'
import settings from '../values/settings'
import getHeight from './get-height'
import getWidth from './get-width'

function callOnBeforeResize(
  newSize: number,
  event: string,
  direction: 'height' | 'width',
): number {
  const returnedSize = settings.onBeforeResize(newSize, event, direction)

  if (returnedSize === undefined) {
    throw new TypeError(
      'No value returned from onBeforeResize(), expected a numeric value',
    )
  }

  if (Number.isNaN(returnedSize))
    throw new TypeError(
      `Invalid value returned from onBeforeResize(): ${returnedSize}, expected Number`,
    )

  if (returnedSize < MIN_SIZE) {
    throw new RangeError(
      `Out of range value returned from onBeforeResize(): ${returnedSize}, must be at least ${MIN_SIZE}`,
    )
  }

  return returnedSize
}

const createGetNewSize =
  (direction: any, directionName: 'height' | 'width') =>
  (mode: string, event: string): number => {
    const calculatedSize = direction[mode]()

    return direction.enabled() && settings.onBeforeResize !== undefined
      ? callOnBeforeResize(calculatedSize, event, directionName)
      : calculatedSize
  }

export const getNewHeight = createGetNewSize(getHeight, 'height')
export const getNewWidth = createGetNewSize(getWidth, 'width')
