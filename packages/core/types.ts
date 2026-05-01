/**
 * Shared type definitions for iframe-resizer.
 * Canonical source of truth for the parent-side public API.
 */

import type { IFrameVersion } from '@iframe-resizer/common'
import {
  AUTO,
  BOTH,
  COLLAPSE,
  EXPAND,
  HORIZONTAL,
  NONE,
  OMIT,
  VERTICAL,
} from '@iframe-resizer/common/consts'

export type IFrameDirection =
  | typeof VERTICAL
  | typeof HORIZONTAL
  | typeof NONE
  | typeof BOTH

export type IFrameLogOption = boolean | typeof EXPAND | typeof COLLAPSE | number

export type IFrameScrollOption = boolean | typeof AUTO | typeof OMIT

// --- Resizer object attached to iframe.iframeResizer ---

export interface IFrameObject {
  /** @deprecated Use disconnect() and remove the iframe via your framework instead. */
  close(): void
  /** Disconnect iframe-resizer from the iframe. */
  disconnect(): void
  /** Returns the child and parent iframe-resizer versions. */
  getVersion(): IFrameVersion
  /** Move the page in the iframe to the specified anchor. */
  moveToAnchor(anchor: string): void
  /** Send a message to the iframe. */
  sendMessage(message: any, targetOrigin?: string): void
}

// --- Extended HTMLIFrameElement ---

/** HTMLIFrameElement with the `iframeResizer` control object attached. */
export interface IFrameComponent extends HTMLIFrameElement {
  iframeResizer: IFrameObject
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

export type { IFrameVersion }

export interface IFrameScrollData {
  iframe: IFrameComponent
  top: number
  left: number
  /** @deprecated Use `left` instead. */
  x: number
  /** @deprecated Use `top` instead. */
  y: number
}

// --- Options ---

export interface IFrameOptions {
  /** @deprecated Use CSS in the child page instead. */
  bodyBackground?: string | null
  /** @deprecated Use CSS in the child page instead. */
  bodyMargin?: number | string | null
  /** @deprecated Use CSS in the child page instead. */
  bodyPadding?: number | string | null
  /**
   * When set to true, only allow incoming messages from the domain listed in the
   * src property of the iframe tag. If your iframe navigates between different
   * domains, ports or protocols; then you will need to provide an array of URLs
   * or disable this option.
   */
  checkOrigin?: boolean | string[]
  /** Set the resizing direction of the iframe. */
  direction?: IFrameDirection
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
  log?: IFrameLogOption
  /** Set offset size of iframe content. */
  offsetSize?: number
  /** Enable scroll bars in the iframe. */
  scrolling?: IFrameScrollOption
  /**
   * Set the number of pixels the iframe content size has to change by,
   * before triggering a resize of the iframe.
   */
  tolerance?: number
  /** @deprecated No longer required in modern browsers. */
  waitForLoad?: boolean
  /** Timeout in ms before warning if iframe has not responded. */
  warningTimeout?: number
  /**
   * Called before iframe is closed via parentIframe.close() or
   * iframe.iframeResizer.close() methods. Returning false will prevent
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
   * parentIframe.sendMessage() method.
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
  onScroll?(data: IFrameScrollData): boolean | void
}
