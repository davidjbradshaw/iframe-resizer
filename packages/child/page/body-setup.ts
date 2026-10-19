import checkBoth from '../check/both'
import settings from '../values/settings'
import injectClearFixIntoBodyElement from './clear-fix'
import { reapplyBodyWidth } from './content-width'
import { setBodyStyle, setMargin } from './css'
import stopInfiniteResizingOfIframe from './stop-infinite-resizing'

// The body-scoped init steps, re-run when the page replaces its <body>: a
// fresh body (Turbo Drive) has none of the inline styles the old one was given
export default function applyBodySetup(): void {
  const { bodyBackground, bodyPadding } = settings

  setMargin(settings)
  setBodyStyle('background', bodyBackground)
  setBodyStyle('padding', bodyPadding)

  if (!checkBoth(settings)) stopInfiniteResizingOfIframe()
  reapplyBodyWidth()
  injectClearFixIntoBodyElement()
}
