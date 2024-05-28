export default (props) => {
  const {
    license,
    bodyBackground,
    bodyMargin,
    bodyPadding,
    checkOrigin,
    direction,
    inPageLinks,
    offset,
    offsetHeight,
    offsetWidth,
    scrolling,
    tolerance,
    warningTimeout,
    onClosed,
    onReady,
    onMessage,
    onResized,
    ...iframeProps
  } = props

  return iframeProps
}
