import { HEIGHT, HEIGHT_EDGE } from '../../common/consts'
import settings from '../values/settings'
import getAutoSize from './auto'
import getMaxElement from './max-element'

const getHeight = {
  label: HEIGHT,
  enabled: () => settings.calculateHeight,
  getOffset: () => settings.offsetHeight,
  auto: () => getAutoSize(getHeight),
  boundingClientRect: () =>
    Math.max(
      document.documentElement.getBoundingClientRect().bottom,
      document.body.getBoundingClientRect().bottom,
    ),
  documentElementScroll: () => document.documentElement.scrollHeight,
  taggedElement: () => getMaxElement(HEIGHT_EDGE),
}

export default getHeight
