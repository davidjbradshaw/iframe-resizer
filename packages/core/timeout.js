import { OBJECT } from '../common/consts'
import { advise, event } from './console'

function showWarning(id, settings) {
  const { iframe, waitForLoad } = settings[id]
  const { sandbox } = iframe
  const hasSandbox =
    typeof sandbox === OBJECT &&
    sandbox.length > 0 &&
    !(
      sandbox.contains('allow-scripts') && sandbox.contains('allow-same-origin')
    )

  event(id, 'noResponse')
  advise(
    id,
    `<rb>No response from iframe</>
          
The iframe (<i>${id}</>) has not responded within ${settings[id].warningTimeout / 1000} seconds. Check <b>@iframe-resizer/child</> package has been loaded in the iframe.
${
  waitForLoad
    ? `
The <b>waitForLoad</> option is currently set to <b>'true'</>. If the iframe loads before <i>iframe-resizer</> runs, this option will prevent <i>iframe-resizer</> initialising. To disable this option, set <b>waitForLoad</> to <b>'false'</>.  
`
    : ''
}${
      hasSandbox
        ? `
The iframe has the <b>sandbox</> attribute, please ensure it contains both the <i>'allow-same-origin'</> and <i>'allow-scripts'</> values.
`
        : ''
    }
This message can be ignored if everything is working, or you can set the <b>warningTimeout</> option to a higher value or zero to suppress this warning.
`,
  )
}

export default function warnOnNoResponse(id, settings) {
  function warning() {
    if (settings[id] === undefined) return // iframe has been closed while we were waiting

    const { ready, loadErrorShown } = settings[id]

    settings[id].msgTimeout = undefined

    if (ready || loadErrorShown) return

    settings[id].loadErrorShown = true
    showWarning(id, settings)
  }

  const { msgTimeout, warningTimeout } = settings[id]

  if (!warningTimeout) return
  if (msgTimeout) clearTimeout(msgTimeout)

  settings[id].msgTimeout = setTimeout(warning, warningTimeout)
}
