import { OBJECT } from '../common/consts'
import { advise, event } from './console'

const getOrigin = (url) => {
  try {
    return new URL(url).origin
  } catch (error) {
    return null
  }
}

const allowsScriptsAndOrigin = (sandbox) =>
  typeof sandbox === OBJECT &&
  sandbox.length > 0 &&
  !(sandbox.contains('allow-scripts') && sandbox.contains('allow-same-origin'))

function showWarning(iframeSettings) {
  const {
    checkOrigin,
    iframe: { id, src, sandbox },
    initialisedFirstPage,
    waitForLoad,
    warningTimeout,
  } = iframeSettings
  const targetOrigin = getOrigin(src)

  event(id, 'noResponse')
  advise(
    id,
    `<rb>No response from iframe</>

The iframe (<i>${id}</>) has not responded within ${warningTimeout / 1000} seconds. Check <b>@iframe-resizer/child</> package has been loaded in the iframe.
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

const hasClosed = (iframeSettings) => iframeSettings === undefined
const resetTimeout = (iframeSettings) => (iframeSettings.msgTimeout = undefined)

function hasInitialised(iframeSettings) {
  const { initialised } = iframeSettings
  if (initialised) {
    // Flag at least one successful initialisation in iframe
    iframeSettings.initialisedFirstPage = true
  }
  return initialised
}

export default function warnOnNoResponse(id, settings) {
  function responseCheck() {
    if (settings[id] === undefined) return
    const iframeSettings = settings[id]
    resetTimeout(iframeSettings)
    if (hasInitialised(iframeSettings)) return
    showWarning(iframeSettings)
  }

  const iframeSettings = settings[id]
  const { msgTimeout, warningTimeout } = iframeSettings

  if (!warningTimeout) return
  if (msgTimeout) clearTimeout(msgTimeout)

  iframeSettings.msgTimeout = setTimeout(responseCheck, warningTimeout)
}
