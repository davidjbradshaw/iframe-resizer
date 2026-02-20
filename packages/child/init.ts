import { INIT, VERSION } from '../common/consts'
import { id, once } from '../common/utils'
import checkBlockingCSS from './check/blocking-css'
import checkBoth from './check/both'
import { checkHeightMode, checkWidthMode } from './check/calculation-mode'
import checkCrossDomain from './check/cross-domain'
import checkDeprecatedAttrs from './check/deprecated-attributes'
import checkIgnoredElements from './check/ignored-elements'
import checkMode from './check/mode'
import checkQuirksMode from './check/quirks-mode'
import checkReadyYet from './check/ready'
import checkSettings from './check/settings'
import checkAndSetupTags from './check/tags'
import checkVersion from './check/version'
import {
  endAutoGroup,
  event as consoleEvent,
  log,
  setConsoleOptions,
} from './console'
import setupMouseEvents from './events/mouse'
import setupOnPageHide from './events/page-hide'
import setupPrintListeners from './events/print'
import setupPublicMethods from './methods'
import attachObservers from './observed'
import createApplySelectors from './page/apply-selectors'
import injectClearFixIntoBodyElement from './page/clear-fix'
import { setBodyStyle, setMargin } from './page/css'
import setupInPageLinks from './page/links'
import stopInfiniteResizingOfIframe from './page/stop-infinite-resizing'
import readDataFromPage from './read/from-page'
import readDataFromParent from './read/from-parent'
import sendSize from './send/size'
import sendTitle from './send/title'
import isolate from './utils/isolate'
import map2settings from './utils/map-settings'
import settings from './values/settings'
import state from './values/state'

function startLogging({ logExpand, logging, parentId }: { logExpand: boolean; logging: boolean; parentId: string }): void {
  setConsoleOptions({ id: parentId, enabled: logging, expand: logExpand })
  consoleEvent('initReceived')
  log(`Initialising iframe v${VERSION} ${window.location.href}`)
}

function startIframeResizerChild({
  bodyBackground,
  bodyPadding,
  inPageLinks,
  onReady,
}: { bodyBackground: string; bodyPadding: string; inPageLinks: boolean; onReady: () => void }): void {
  const bothDirections = checkBoth(settings)

  const setup = [
    () => checkVersion(settings),
    () => checkMode(settings),
    checkIgnoredElements,
    checkCrossDomain,
    checkHeightMode,
    checkWidthMode,
    checkDeprecatedAttrs,
    checkQuirksMode,
    checkAndSetupTags,
    checkSettings,
    bothDirections ? id : checkBlockingCSS,

    () => setMargin(settings),
    () => setBodyStyle('background', bodyBackground),
    () => setBodyStyle('padding', bodyPadding),

    bothDirections ? id : stopInfiniteResizingOfIframe,
    injectClearFixIntoBodyElement,

    state.applySelectors,
    attachObservers,

    () => setupInPageLinks(inPageLinks),
    setupPrintListeners,
    () => setupMouseEvents(settings),
    setupOnPageHide,
    () => setupPublicMethods(),
  ]

  isolate(setup)

  checkReadyYet(once(onReady))
  log('Initialization complete', settings)
  endAutoGroup()

  sendSize(
    INIT,
    'Init message from host page',
    undefined,
    undefined,
    `${VERSION}:${settings.mode}`,
  )

  sendTitle()
}

export default function (data: string[]): void {
  if (!state.firstRun) return

  map2settings(readDataFromParent(data))
  startLogging(settings)
  map2settings(readDataFromPage())

  state.applySelectors = createApplySelectors(settings)

  startIframeResizerChild(settings)
}
