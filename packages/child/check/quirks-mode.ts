import { advise } from '../console'

const QUIRKS_MODE = 'BackCompat'

const DEPRECATED = `<rb>Quirks Mode Detected</>

This iframe is running in the browser's legacy <b>Quirks Mode</>, this may cause issues with the correct operation of <i>iframe-resizer</>. It is recommended that you switch to the modern <b>Standards Mode</>.

For more information see <u>https://iframe-resizer.com/quirks-mode</>.
`

export default function checkQuirksMode(): void {
  if (document.compatMode !== QUIRKS_MODE) return
  advise(DEPRECATED)
}
