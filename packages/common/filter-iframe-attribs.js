export default (props) => {
  const {
    license,
    bodyBackground,
    bodyMargin,
    bodyPadding,
    checkOrigin,
    inPageLinks,
    offset,
    offsetHeight,
    offsetWidth,
    scrolling,
    warningTimeout,
    tolerance,
    onClosed,
    onReady,
    onMessage,
    onResized,
    ...iframeProps
  } = props

  return iframeProps
}
