import type { IFrameOptions } from '@iframe-resizer/core'

// Pick the iframe-resizer options that affect the wire payload from a Solid
// store-backed `local` props bag, dropping undefined values. Reading each
// property explicitly here also lets Solid's reactivity track them when this
// helper is called inside a `createEffect`.
export default function pickWireOptions(
  local: Record<string, any>,
): IFrameOptions {
  const optional = {
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
  return {
    license: local.license,
    ...Object.fromEntries(
      Object.entries(optional).filter(([, v]) => v !== undefined),
    ),
  }
}
