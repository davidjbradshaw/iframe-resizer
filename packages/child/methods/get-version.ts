import type { IFrameVersion } from '@iframe-resizer/common'
import { FALSE, VERSION } from '@iframe-resizer/common/consts'

import settings from '../values/settings'

export default function getVersion(): IFrameVersion {
  const { version } = settings

  return {
    child: VERSION,
    parent: !version || version === FALSE ? 'legacy' : version,
  }
}
