// Pick the iframe-resizer options that affect the wire payload from a Solid
// store-backed `local` props bag, dropping undefined values. Reading each
// property explicitly here also lets Solid's reactivity track them when this
// helper is called inside a `createEffect`.
export default function pickWireOptions(
  local: Record<string, any>,
): Record<string, any> {
  const all = {
    license: local.license,
    bodyBackground: local.bodyBackground,
    bodyMargin: local.bodyMargin,
    bodyPadding: local.bodyPadding,
    checkOrigin: local.checkOrigin,
    direction: local.direction,
    inPageLinks: local.inPageLinks,
    log: local.log,
    offsetSize: local.offsetSize,
    scrolling: local.scrolling,
    tolerance: local.tolerance,
    warningTimeout: local.warningTimeout,
  }
  return Object.fromEntries(
    Object.entries(all).filter(([, v]) => v !== undefined),
  )
}
