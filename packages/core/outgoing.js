import { CHILD } from '../common/consts'
import page from './values/page'
import settings from './values/settings'

export default function (iframeId) {
  const {
    sizeWidth,
    log,
    autoResize,
    bodyMargin,
    heightCalculationMethod,
    bodyBackground,
    bodyPadding,
    tolerance,
    inPageLinks,
    widthCalculationMethod,
    mouseEvents,
    offsetHeight,
    offsetWidth,
    sizeHeight,
    license,
    mode,
    logExpand,
  } = settings[iframeId]

  return [
    iframeId,
    '8', // Backwards compatibility (PaddingV1)
    sizeWidth,
    log,
    '32', // Backwards compatibility (Interval)
    true, // Backwards compatibility (EnablePublicMethods)
    autoResize,
    bodyMargin,
    heightCalculationMethod,
    bodyBackground,
    bodyPadding,
    tolerance,
    inPageLinks,
    CHILD, // Backwards compatibility (resizeFrom)
    widthCalculationMethod,
    mouseEvents,
    offsetHeight,
    offsetWidth,
    sizeHeight,
    license,
    page.version,
    mode,
    '', // sizeSelector
    logExpand,
  ].join(':')
}
