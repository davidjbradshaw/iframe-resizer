import { WIDTH, WIDTH_EDGE } from '../../common/consts'
import settings from '../values/settings'
import getAutoSize from './auto'
import getMaxElement from './max-element'

const getWidth = {
  label: WIDTH,
  enabled: () => settings.calculateWidth,
  getOffset: () => settings.offsetWidth,
  auto: () => getAutoSize(getWidth),
  boundingClientRect: () =>
    Math.max(
      document.documentElement.getBoundingClientRect().right,
      document.body.getBoundingClientRect().right,
    ),
  documentElementScroll: () => document.documentElement.scrollWidth,
  taggedElement: () => getMaxElement(WIDTH_EDGE),
}

export default getWidth
