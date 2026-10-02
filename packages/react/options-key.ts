// Build a stable string key from the iframe-resizer options that affect the
// wire payload. Used as a useEffect dependency so we re-call connectResizer
// (which then takes the update path in core) when the user changes options.
// Callback identity is intentionally excluded — callbacks aren't part of the
// wire payload and would otherwise cause spurious updates on every render.
// Their presence is included, so adding or removing one re-binds.
export default ({
  id,
  license,
  log,
  bodyBackground,
  bodyMargin,
  bodyPadding,
  checkOrigin,
  direction,
  inPageLinks,
  offsetSize,
  scrolling,
  tolerance,
  waitForLoad,
  warningTimeout,
  onMessage,
  onMouseEnter,
  onMouseLeave,
  onReady,
  onResized,
  onScroll,
}: Record<string, unknown>): string =>
  JSON.stringify({
    id,
    license,
    log,
    bodyBackground,
    bodyMargin,
    bodyPadding,
    checkOrigin,
    direction,
    inPageLinks,
    offsetSize,
    scrolling,
    tolerance,
    waitForLoad,
    warningTimeout,
    hasMessage: typeof onMessage === 'function',
    hasMouseEnter: typeof onMouseEnter === 'function',
    hasMouseLeave: typeof onMouseLeave === 'function',
    hasReady: typeof onReady === 'function',
    hasResized: typeof onResized === 'function',
    hasScroll: typeof onScroll === 'function',
  })
