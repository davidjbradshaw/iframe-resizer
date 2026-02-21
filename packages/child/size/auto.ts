import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { HEIGHT, MIN_SIZE } from '../../common/consts'
import { info } from '../console'
import state from '../values/state'

const BOUNDING_FORMAT = [HIGHLIGHT, FOREGROUND, HIGHLIGHT]

const prevScrollSize = {
  height: 0,
  width: 0,
}

const prevBoundingSize = {
  height: 0,
  width: 0,
}

function getBoundingClientRect(dimension: string, boundingSize: number, scrollSize: number): number {
  prevBoundingSize[dimension] = boundingSize
  prevScrollSize[dimension] = scrollSize
  return boundingSize
}

function getOffset(getDimension: any): number {
  const offset = getDimension.getOffset()
  if (offset !== 0) info(`Page offsetSize: %c${offset}px`, HIGHLIGHT)
  return offset
}

const getAdjustedScroll = (getDimension: any): number =>
  getDimension.documentElementScroll() + Math.max(0, getDimension.getOffset())

export default function getAutoSize(getDimension: any): number {
  const { hasOverflow, hasTags, triggerLocked } = state
  const dimension = getDimension.label
  const isHeight = dimension === HEIGHT
  const boundingSize = getDimension.boundingClientRect()
  const ceilBoundingSize = Math.ceil(boundingSize)
  const floorBoundingSize = Math.floor(boundingSize)
  const scrollSize = getAdjustedScroll(getDimension)
  const sizes = `HTML: %c${boundingSize}px %cPage: %c${scrollSize}px`

  let calculatedSize

  switch (true) {
    case !getDimension.enabled():
      return Math.max(scrollSize, MIN_SIZE)

    case hasTags:
      info(`Found element with data-iframe-size attribute`)
      calculatedSize = getDimension.taggedElement()
      break

    case !hasOverflow &&
      state.firstRun &&
      prevBoundingSize[dimension] === 0 &&
      prevScrollSize[dimension] === 0:
      info(`Initial page size values: ${sizes}`, ...BOUNDING_FORMAT)
      calculatedSize = getBoundingClientRect(
        dimension,
        boundingSize,
        scrollSize,
      )
      break

    case triggerLocked &&
      boundingSize === prevBoundingSize[dimension] &&
      scrollSize === prevScrollSize[dimension]:
      info(`Size unchanged: ${sizes}`, ...BOUNDING_FORMAT)
      calculatedSize = Math.max(boundingSize, scrollSize)
      break

    case boundingSize === 0 && scrollSize !== 0:
      info(`Page is hidden: ${sizes}`, ...BOUNDING_FORMAT)
      calculatedSize = scrollSize
      break

    case !hasOverflow &&
      boundingSize !== prevBoundingSize[dimension] &&
      scrollSize <= prevScrollSize[dimension]:
      info(`New <html> size: ${sizes} `, ...BOUNDING_FORMAT)
      info(
        `Previous <html> size: %c${prevBoundingSize[dimension]}px`,
        HIGHLIGHT,
      )
      calculatedSize = getBoundingClientRect(
        dimension,
        boundingSize,
        scrollSize,
      )
      break

    case !isHeight:
      calculatedSize = getDimension.taggedElement()
      break

    case !hasOverflow && boundingSize < prevBoundingSize[dimension]:
      info(`<html> size decreased: ${sizes}`, ...BOUNDING_FORMAT)
      calculatedSize = getBoundingClientRect(
        dimension,
        boundingSize,
        scrollSize,
      )
      break

    case scrollSize === floorBoundingSize || scrollSize === ceilBoundingSize:
      info(`<html> size equals page size: ${sizes}`, ...BOUNDING_FORMAT)
      calculatedSize = getBoundingClientRect(
        dimension,
        boundingSize,
        scrollSize,
      )
      break

    case boundingSize > scrollSize:
      info(`Page size < <html> size: ${sizes}`, ...BOUNDING_FORMAT)
      calculatedSize = getBoundingClientRect(
        dimension,
        boundingSize,
        scrollSize,
      )
      break

    case hasOverflow:
      info(`Found elements possibly overflowing <html> `)
      calculatedSize = getDimension.taggedElement()
      break

    default:
      info(`Using <html> size: ${sizes}`, ...BOUNDING_FORMAT)
      calculatedSize = getBoundingClientRect(
        dimension,
        boundingSize,
        scrollSize,
      )
  }

  info(`Content ${dimension}: %c${calculatedSize}px`, HIGHLIGHT)

  calculatedSize += getOffset(getDimension)

  return Math.max(calculatedSize, MIN_SIZE)
}
