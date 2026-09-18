import { hasOwn, isString } from '@iframe-resizer/common'
import {
  COLLAPSE,
  EXPAND,
  LOG_COLLAPSED,
  LOG_DISABLED,
  LOG_EXPANDED,
} from '@iframe-resizer/common/consts'

// Normalize the IFrameLogOption value: numeric levels (LOG_DISABLED=0,
// LOG_COLLAPSED=1, LOG_EXPANDED=2) get mapped to their string equivalents,
// then any string is collapsed to log:true with logExpand derived from the
// string. Mutates `options` in place. No-op if `log` was not provided.
// Mirrors the handling in setup/logging.ts so update paths don't leak
// non-boolean values into settings.log.
export default function normalizeLog(options: Record<string, any>): void {
  if (!hasOwn(options, 'log')) return

  switch (options.log) {
    case LOG_DISABLED:
      options.log = false
      break

    case LOG_COLLAPSED:
      options.log = COLLAPSE
      break

    case LOG_EXPANDED:
      options.log = EXPAND
      break

    default:
      break
  }

  if (isString(options.log)) {
    if (!hasOwn(options, 'logExpand')) {
      options.logExpand = options.log === EXPAND
    }
    options.log = true
  }
}
