import { CHILD, SEPARATOR } from '../../common/consts'
import page from '../values/page'
import settings from '../values/settings'

// Backwards compatibility consts
const V1_PADDING = '8'
const INTERVAL = '32'
const RESIZE_FROM = CHILD
const PUBLIC_METHODS = true

export default function createOutgoingMessage(id: string): string {
  const {
    autoResize,
    bodyBackground,
    bodyMargin,
    bodyPadding,
    heightCalculationMethod,
    inPageLinks,
    license,
    log,
    logExpand,
    mouseEvents,
    offsetHeight,
    offsetWidth,
    mode,
    sizeHeight,
    // sizeSelector,
    sizeWidth,
    tolerance,
    widthCalculationMethod,
  } = settings[id]

  return [
    id,
    V1_PADDING,
    sizeWidth,
    log,
    INTERVAL,
    PUBLIC_METHODS,
    autoResize,
    bodyMargin,
    heightCalculationMethod,
    bodyBackground,
    bodyPadding,
    tolerance,
    inPageLinks,
    RESIZE_FROM,
    widthCalculationMethod,
    mouseEvents,
    offsetHeight,
    offsetWidth,
    sizeHeight,
    license,
    page.version,
    mode,
    '', // sizeSelector,
    logExpand,
  ].join(SEPARATOR)
}
