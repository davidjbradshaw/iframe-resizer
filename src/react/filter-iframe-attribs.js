export default (props) => {
  const {
    autoResize,
    bodyBackground,
    bodyMargin,
    bodyPadding,
    checkOrigin,
    inPageLinks,
    heightCalculationMethod,
    interval,
    log,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    resizeFrom,
    scrolling,
    sizeHeight,
    sizeWidth,
    warningTimeout,
    tolerance,
    widthCalculationMethod,
    onClosed,
    onInit,
    onMessage,
    onResized,
    ...iframeProps
  } = props

  return iframeProps
}
