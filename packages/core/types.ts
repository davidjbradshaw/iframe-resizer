// TODO: Check which type should be exported or belong to the core

export type IFrameObject = {
  close(): void
  moveToAnchor(anchor: string): void
  disconnect(): void
  resize(): void
  sendMessage(message: any, targetOrigin?: string): void
}

export type IFrameComponent = HTMLIFrameElement & {
  iFrameResizer: IFrameObject
}

// TODO: Use the core options, each UI lib has it's own extended options
export type ResizerOptions = {
  bodyBackground?: string | null
  bodyMargin?: string | number | null
  bodyPadding?: string | number | null
  checkOrigin?: boolean | string[]
  direction?: 'vertical' | 'horizontal' | 'none' | 'both'
  inPageLinks?: boolean
  license: string
  log?: boolean | 'expanded' | 'collapsed' | number
  offsetSize?: number
  scrolling?: boolean | 'auto' | 'omit'
  tolerance?: number
  waitForLoad?: boolean
  warningTimeout?: number
}

// Resizer Events
export type ResizerEvents = {
  onCLosed?: (iframeId: string) => void // Remove in v6
  onAfterClose?: (iframeId: string) => void
  onBeforeClose?: (iframeId: string) => void
  onMessage?: (ev: { iframe: IFrameComponent; message: any }) => void
  onMouseEnter?: (ev: {
    iframe: IFrameComponent
    height: number
    width: number
    type: string
  }) => void
  onMouseLeave?: (ev: {
    iframe: IFrameComponent
    height: number
    width: number
    type: string
  }) => void
  onReady?: (iframe: IFrameComponent) => void
  onResized?: (ev: {
    iframe: IFrameComponent
    height: number
    width: number
    type: string
  }) => void
  onScroll?: (ev: {
    iframe: IFrameComponent
    top: number
    left: number
  }) => boolean
}

// Child-specific interfaces
export type IFramePageOptions = {
  ignoreSelector?: string
  offsetSize?: number
  sizeSelector?: string
  targetOrigin?: string
  onBeforeResize?: (newSize: number) => number
  onMessage?: (message: any) => void
  onReady?: () => void
}

export type IFramePage = {
  autoResize(resize?: boolean): boolean
  close(): void
  getId(): string
  getParentOrigin(): string
  getParentProps(callback: (data: ParentProps) => void): () => void
  moveToAnchor(hash: string): void
  scrollBy(x: number, y: number): void
  scrollTo(x: number, y: number): void
  scrollToOffset(x: number, y: number): void
  sendMessage(message: any, targetOrigin?: string): void
  setOffsetSize(offsetSize: number): void
  setTargetOrigin(targetOrigin: string): void
  resize(customHeight?: string, customWidth?: string): void
}

export type ParentProps = {
  iframe: {
    x: number
    y: number
    width: number
    height: number
    top: number
    right: number
    bottom: number
    left: number
  }
  document: {
    scrollWidth: number
    scrollHeight: number
  }
  viewport: {
    width: number
    height: number
    offsetLeft: number
    offsetTop: number
    pageLeft: number
    pageTop: number
    scale: number
  }
}

// Event data interfaces
export type IFrameMouseData = {
  iframe: IFrameComponent
  height: number
  width: number
  type: string
}

export type IFrameResizedData = {
  iframe: IFrameComponent
  height: number
  width: number
  type: string
}

export type IFrameMessageData = {
  iframe: IFrameComponent
  message: any
}

export type IFrameScrollData = {
  x: number
  y: number
}
