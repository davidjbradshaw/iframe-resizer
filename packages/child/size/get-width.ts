import { WIDTH, WIDTH_EDGE } from '../../common/consts'
import { warn } from '../console'
import settings from '../values/settings'
import { getAllMeasurements } from './all'
import getAutoSize from './auto'
import getMaxElement from './max-element'

const getWidth = {
  label: WIDTH,
  enabled: () => settings.calculateWidth,
  getOffset: () => settings.offsetWidth,
  auto: () => getAutoSize(getWidth),
  bodyScroll: () => document.body.scrollWidth,
  bodyOffset: () => document.body.offsetWidth,
  documentElementScroll: () => document.documentElement.scrollWidth,
  documentElementOffset: () => document.documentElement.offsetWidth,
  boundingClientRect: () =>
    Math.max(
      document.documentElement.getBoundingClientRect().right,
      document.body.getBoundingClientRect().right,
    ),
  max: () => Math.max(...getAllMeasurements(getWidth)),
  min: () => Math.min(...getAllMeasurements(getWidth)),
  rightMostElement: () => getMaxElement(WIDTH_EDGE),
  scroll: () =>
    Math.max(getWidth.bodyScroll(), getWidth.documentElementScroll()),
  taggedElement: () => getMaxElement(WIDTH_EDGE),
  custom: () => {
    warn('Custom width calculation function not defined')
    return getWidth.auto()
  },
}

export default getWidth
