/**
 * Type definitions for @iframe-resizer/child
 */

import type { IFrameVersion } from '@iframe-resizer/common'

/** Configuration options set via window.iframeResizer before loading the child script. */
export interface PageOptions {
  /** Restrict which elements are checked for resizing. */
  ignoreSelector?: string
  /** Offset added to the calculated size. */
  offsetSize?: number
  /** CSS selector for elements to use for size calculation. */
  sizeSelector?: string
  /** Restrict which parent origins can communicate with the iframe. */
  targetOrigin?: string | string[]
  /** Called before new size is set. Return a number to modify the new size. */
  onBeforeResize?(newSize: number): number
  /** Receive message posted from the parent page. */
  onMessage?(message: any): void
  /** Called once iframe-resizer has been initialized. */
  onReady?(): void
}

/** Parent page properties returned by getParentProps(). */
export interface ParentProps {
  /** Values from iframe.getBoundingClientRect() */
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
  /** Document scroll dimensions */
  document: {
    scrollWidth: number
    scrollHeight: number
  }
  /** Visual viewport properties */
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

/** Child public API available at window.parentIframe. */
export interface ParentIframe {
  /** Turn autoResizing of the iframe on and off. Returns current state. */
  autoResize(resize?: boolean): boolean
  /** Remove the iframe from the parent page. */
  close(): void
  /** Returns the ID of the iframe. */
  getId(): string
  /** Returns the child and parent iframe-resizer versions. */
  getVersion(): IFrameVersion
  /** Returns the origin of the parent page. */
  getParentOrigin(): string
  /**
   * Request parent page properties. Your callback is recalled on
   * parent scroll/resize. Returns an unsubscribe function.
   */
  getParentProps(callback: (data: ParentProps) => void): () => void
  /** Move to anchor in parent page. */
  moveToAnchor(hash: string): void
  /**
   * Manually force iframe to resize. Disable autoResize first to use
   * passed arguments. Enable sizeWidth to set the width.
   */
  resize(customHeight?: number, customWidth?: number): void
  /** Scroll the parent page by x and y. */
  scrollBy(x: number, y: number): void
  /** Scroll the parent page to the coordinates x and y. */
  scrollTo(x: number, y: number): void
  /** Scroll the parent page to x and y relative to the iframe position. */
  scrollToOffset(x: number, y: number): void
  /** Send data to the containing page. */
  sendMessage(message: any, targetOrigin?: string): void
  /** Set offset added to the calculated size. */
  setOffsetSize(offsetSize: number): void
  /** Set default target origin for postMessage. */
  setTargetOrigin(targetOrigin: string): void
}

declare global {
  interface Window {
    iframeResizer: PageOptions
    parentIframe: ParentIframe
  }
}
