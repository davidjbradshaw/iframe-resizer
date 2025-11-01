import { HEIGHT, HEIGHT_EDGE } from '../../common/consts'
import { warn } from '../console'
import settings from '../values/settings'
import { getAllMeasurements } from './all'
import getAutoSize from './auto'
import getBodyOffset from './body-offset'
import getMaxElement from './max-element'

const getHeight = {
  label: HEIGHT,
  enabled: () => settings.calculateHeight,
  getOffset: () => settings.offsetHeight,
  auto: () => getAutoSize(getHeight),
  bodyOffset: getBodyOffset,
  bodyScroll: () => document.body.scrollHeight,
  offset: () => getHeight.bodyOffset(), // Backwards compatibility
  documentElementOffset: () => document.documentElement.offsetHeight,
  documentElementScroll: () => document.documentElement.scrollHeight,
  boundingClientRect: () =>
    Math.max(
      document.documentElement.getBoundingClientRect().bottom,
      document.body.getBoundingClientRect().bottom,
    ),
  max: () => Math.max(...getAllMeasurements(getHeight)),
  min: () => Math.min(...getAllMeasurements(getHeight)),
  grow: () => getHeight.max(),
  lowestElement: () => getMaxElement(HEIGHT_EDGE),
  taggedElement: () => getMaxElement(HEIGHT_EDGE),
  custom: () => {
    warn('Custom height calculation function not defined')
    return getHeight.auto()
  },
}

export default getHeight
