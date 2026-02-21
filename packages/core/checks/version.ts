import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { VERSION } from '../../common/consts'
import { advise, log } from '../console'

export default function checkVersion(id: string, version: string | undefined): void {
  if (version === VERSION) return
  if (version === undefined) {
    advise(
      id,
      `<rb>Legacy version detected in iframe</>

Detected legacy version of child page script. It is recommended to update the page in the iframe to use <b>@iframe-resizer/child</>.

See <u>https://iframe-resizer.com/setup/#child-page-setup</> for more details.
`,
    )
    return
  }
  log(
    id,
    `Version mismatch (Child: %c${version}%c !== Parent: %c${VERSION})`,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
  )
}
