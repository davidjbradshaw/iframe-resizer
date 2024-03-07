export default (props) => {
  const {
    bodyBackground,
    bodyMargin,
    bodyPadding,
    checkOrigin,
    inPageLinks,
    offsetHeight,
    offsetWidth,
    scrolling,
    warningTimeout,
    tolerance,
    onClosed,
    onInit,
    onMessage,
    onResized,
    ...iframeProps
  } = props

  return iframeProps
}
