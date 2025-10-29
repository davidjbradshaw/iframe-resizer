import { FALSE, VERSION } from '../../common/consts'
import { advise } from '../console'

export default function checkVersion({ version }) {
  if (!version || version === '' || version === FALSE) {
    advise(
      `<rb>Legacy version detected on parent page</>

Detected legacy version of parent page script. It is recommended to update the parent page to use <b>@iframe-resizer/parent</>.

See <u>https://iframe-resizer.com/setup/</> for more details.
`,
    )
    return
  }

  if (version !== VERSION) {
    advise(
      `<b>Version mismatch</>

The parent and child pages are running different versions of <i>iframe resizer</>.

Parent page: ${version} - Child page: ${VERSION}.
`,
    )
  }
}
