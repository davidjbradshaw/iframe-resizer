export default (props) => {
  const {
    license,
    bodyBackground,
    bodyMargin,
    bodyPadding,
    checkOrigin,
    direction,
    inPageLinks,
    log,
    offset,
    offsetHeight,
    offsetWidth,
    scrolling,
    tolerance,
    warningTimeout,
    waitForLoad,
    onClosed,
    onReady,
    onMessage,
    onResized,
    ...iframeProps
  } = props

  return iframeProps
}
