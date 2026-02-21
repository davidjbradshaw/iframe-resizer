import { OBJECT } from '../../common/consts'
import { advise, event } from '../console'

const getOrigin = (url: string): string | null => {
  try {
    return new URL(url).origin
  } catch (error) {
    return null
  }
}

const allowsScriptsAndOrigin = (sandbox: any): boolean =>
  typeof sandbox === OBJECT &&
  sandbox.length > 0 &&
  !(sandbox.contains('allow-scripts') && sandbox.contains('allow-same-origin'))

function showWarning(id: string, settings: Record<string, any>): void {
  const {
    checkOrigin,
    iframe: { src, sandbox },
    initialisedFirstPage,
    waitForLoad,
  } = settings[id]
  const targetOrigin = getOrigin(src)

  event(id, 'noResponse')
  advise(
    id,
    `<rb>No response from iframe</>

The iframe (<i>${id}</>) has not responded within ${settings[id].warningTimeout / 1000} seconds. Check <b>@iframe-resizer/child</> package has been loaded in the iframe.
${
  checkOrigin && targetOrigin
    ? `
The <b>checkOrigin</> option is currently enabled. If the iframe redirects away from <i>${targetOrigin}</>, then the connection to the iframe may be blocked by the browser. To disable this option, set <b>checkOrigin</> to <bb>false</> or an array of allowed origins. See <u>https://iframe-resizer.com/checkorigin</> for more information.
`
    : ''
}${
      waitForLoad && !initialisedFirstPage
        ? `
The <b>waitForLoad</> option is currently set to <bb>true</>. If the iframe loads before <i>iframe-resizer</> runs, this option will prevent <i>iframe-resizer</> initialising. To disable this option, set <b>waitForLoad</> to <bb>false</>.
`
        : ''
    }${
      allowsScriptsAndOrigin(sandbox)
        ? `
The iframe has the <b>sandbox</> attribute, please ensure it contains both the <bb>allow-same-origin</> and <bb>allow-scripts</> values.
`
        : ''
    }
This message can be ignored if everything is working, or you can set the <b>warningTimeout</> option to a higher value or zero to suppress this warning.
`,
  )
}

export default function warnOnNoResponse(id: string, settings: Record<string, any>): void {
  function warning(): void {
    if (settings[id] === undefined) return // iframe has been closed while we were waiting

    const { initialised, loadErrorShown } = settings[id]

    settings[id].msgTimeout = undefined

    if (initialised) {
      settings[id].initialisedFirstPage = true
      return
    }

    if (loadErrorShown) return

    settings[id].loadErrorShown = true
    showWarning(id, settings)
  }

  const { msgTimeout, warningTimeout } = settings[id]

  if (!warningTimeout) return
  if (msgTimeout) clearTimeout(msgTimeout)

  settings[id].msgTimeout = setTimeout(warning, warningTimeout)
}
