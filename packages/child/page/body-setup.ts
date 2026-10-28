import checkBoth from '../check/both'
import settings from '../values/settings'
import injectClearFixIntoBodyElement from './clear-fix'
import { reapplyBodyWidth } from './content-width'
import { setBodyStyle, setMargin } from './css'
import stopInfiniteResizingOfIframe from './stop-infinite-resizing'

// The body-scoped setup steps, as a list so init can isolate each one. Only
// the width step differs: init sets the override, a replaced body re-applies
// it, and this is the one list both go through
export const bodySetupSteps = (setWidth: () => void): (() => void)[] => [
  () => setMargin(settings),
  () => setBodyStyle('background', settings.bodyBackground),
  () => setBodyStyle('padding', settings.bodyPadding),

  // Both directions size the iframe from its content, so there is no loop
  () => {
    if (!checkBoth(settings)) stopInfiniteResizingOfIframe()
  },
  setWidth,
  injectClearFixIntoBodyElement,
]

// Re-run when the page replaces its <body>: a fresh body (Turbo Drive) has
// none of the inline styles the old one was given
export default function applyBodySetup(): void {
  for (const step of bodySetupSteps(reapplyBodyWidth)) step()
}
