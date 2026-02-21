import { FALSE, VERSION } from '../../common/consts'
import { advise } from '../console'

const LEGACY = `<rb>Legacy version detected on parent page</>

Detected legacy version of parent page script. It is recommended to update the parent page to use <b>@iframe-resizer/parent</>.

See <u>https://iframe-resizer.com/setup/</> for more details.
`

const mismatch = (version: string): string => `<b>Version mismatch</>

The parent and child pages are running different versions of <i>iframe resizer</>.

Parent page: ${version} - Child page: ${VERSION}.
`

export default function checkVersion({ version }: { version: string }): void {
  if (!version || version === '' || version === FALSE) {
    advise(LEGACY)
  } else if (version !== VERSION) {
    advise(mismatch(version))
  }
}
