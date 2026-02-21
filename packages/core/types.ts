/**
 * Shared type definitions for iframe-resizer.
 * Canonical source of truth for the parent-side public API.
 */

// --- Resizer object attached to iframe.iFrameResizer ---

export interface IFrameObject {
  /** Remove the iframe from the page. */
  close(): void
  /** Disconnect iframe-resizer from the iframe. */
  disconnect(): void
  /** Move the page in the iframe to the specified anchor. */
  moveToAnchor(anchor: string): void
  /** Tell iframe-resizer to re-measure the iframe. */
  resize(): void
  /** Send a message to the iframe. */
  sendMessage(message: any, targetOrigin?: string): void
}

// --- Extended HTMLIFrameElement ---

/** HTMLIFrameElement with the `iFrameResizer` control object attached. */
export interface IFrameComponent extends HTMLIFrameElement {
  iFrameResizer: IFrameObject
}

// --- Callback event data ---

export interface IFrameMouseData {
  iframe: IFrameComponent
  screenX: number
  screenY: number
  type: string
}

export interface IFrameResizedData {
  iframe: IFrameComponent
  height: number
  width: number
  type: string
}

export interface IFrameMessageData {
  iframe: IFrameComponent
  message: any
}

export interface IFrameScrollData {
  x: number
  y: number
}

// --- Options ---

export interface IFrameOptions {
  /** Override the body background style in the iframe. */
  bodyBackground?: string | null
  /**
   * Override the default body margin style in the iframe.
   * A string can be any valid value for the CSS margin attribute, for example '8px 3em'.
   * A number value is converted into px.
   */
  bodyMargin?: number | string | null
  /**
   * Override the default body padding style in the iframe.
   * A string can be any valid value for the CSS padding attribute, for example '8px 3em'.
   * A number value is converted into px.
   */
  bodyPadding?: number | string | null
  /**
   * When set to true, only allow incoming messages from the domain listed in the
   * src property of the iframe tag. If your iframe navigates between different
   * domains, ports or protocols; then you will need to provide an array of URLs
   * or disable this option.
   */
  checkOrigin?: boolean | string[]
  /** Set the resizing direction of the iframe. */
  direction?: 'vertical' | 'horizontal' | 'none' | 'both'
  /** Custom iframe id. */
  id?: string
  /**
   * When enabled, in-page linking inside the iframe and from the iframe to the
   * parent page will be enabled.
   */
  inPageLinks?: boolean
  /** Set iframe-resizer license key. */
  license: string
  /** Enable/disable console logging. */
  log?: boolean | 'expanded' | 'collapsed' | number
  /** Set offset size of iframe content. */
  offsetSize?: number
  /** Enable scroll bars in the iframe. */
  scrolling?: boolean | 'auto' | 'omit'
  /**
   * Set the number of pixels the iframe content size has to change by,
   * before triggering a resize of the iframe.
   */
  tolerance?: number
  /** Wait for the iframe to load before initializing. */
  waitForLoad?: boolean
  /** Timeout in ms before warning if iframe has not responded. */
  warningTimeout?: number
  /**
   * Called before iframe is closed via parentIFrame.close() or
   * iframe.iFrameResizer.close() methods. Returning false will prevent
   * the iframe from closing.
   */
  onBeforeClose?(iframeId: string): boolean | void
  /** Called after iframe is closed. */
  onAfterClose?(iframeId: string): void
  /** Called when pointer enters the iframe. */
  onMouseEnter?(data: IFrameMouseData): void
  /** Called when pointer leaves the iframe. */
  onMouseLeave?(data: IFrameMouseData): void
  /** Called when iframe-resizer has been initialized. */
  onReady?(iframe: IFrameComponent): void
  /**
   * Receive message posted from the iframe with the
   * parentIFrame.sendMessage() method.
   */
  onMessage?(data: IFrameMessageData): void
  /**
   * Called after iframe resized. Passes event data containing the iframe,
   * height, width and the type of event that triggered the resize.
   */
  onResized?(data: IFrameResizedData): void
  /**
   * Called before the page is repositioned after a request from the iframe.
   * If this function returns false, it will stop the library from
   * repositioning the page, so that you can implement your own scrolling.
   */
  onScroll?(data: IFrameScrollData): boolean
}

// --- Internal message data (used across core event handlers) ---

export interface MessageData {
  id: string
  iframe: HTMLIFrameElement
  height: number
  width: number
  type: string
  msg?: string
  message?: string
  mode?: string
  [key: string]: any
}
