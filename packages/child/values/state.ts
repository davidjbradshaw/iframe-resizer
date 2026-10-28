import { UNDEFINED } from '@iframe-resizer/common/consts'

// None in server-side rendering, where index.ts sets nothing up; a bare
// window would throw there as this module loads
const win = typeof window === UNDEFINED ? undefined : window

export default {
  applySelectors: null,
  firstRun: true,
  // Set once the first init has set the page up, licence check included
  started: false,
  hasTags: false,
  hasOverflow: false,
  height: 0,
  isHidden: false,
  initLock: true,
  findInPageLinkTarget: null as ((location: string) => void) | null,
  origin: undefined,
  hasOverflowUpdated: true,
  // Setting names the page provided in window.iframeResizer; these win over
  // values sent by the parent, on init and on update
  pageSettings: [] as string[],
  // The values the parent last sent, so an update can tell which it changed
  fromParent: {} as Record<string, unknown>,
  overflowedNodeSet: new Set(),
  sameOrigin: false,
  taggedElements: [] as unknown as NodeListOf<Element>,
  target: win?.parent as MessageEventSource | null,
  // Set by the test hook in index.ts, whose specs stand in for the parent
  // window with a plain object
  testHarness: false,
  timerActive: false,
  totalTime: 0,
  triggerLocked: false,
  // Set while a size calculation was triggered by <html> or <body> resizing,
  // which inside an iframe means the viewport changed, not the content
  viewportResized: false,
  width: 0,
  win: win as Window,
  // Kept for backwards compatibility
  onPageInfo: null,
  // Subscribers from getParentProps(), and the last update sent to them
  parentInfo: null as object | null,
  parentInfoListeners: new Set<(info: any) => void>(),
}
