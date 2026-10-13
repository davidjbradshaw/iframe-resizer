export default {
  applySelectors: null,
  firstRun: true,
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
  overflowedNodeSet: new Set(),
  sameOrigin: false,
  taggedElements: [] as unknown as NodeListOf<Element>,
  target: window?.parent as MessageEventSource | null,
  timerActive: false,
  totalTime: 0,
  triggerLocked: false,
  // Set while a size calculation was triggered by <html> or <body> resizing,
  // which inside an iframe means the viewport changed, not the content
  viewportResized: false,
  width: 0,
  win: window,
  onPageInfo: null,
  onParentInfo: null,
}
