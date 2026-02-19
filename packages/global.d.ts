/**
 * Global type augmentations for iframe-resizer.
 *
 * Extends Window and HTMLIFrameElement with custom properties
 * used by iframe-resizer's parent and child scripts.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    // Parent IIFE/UMD globals
    iframeResize: (...args: any[]) => any
    iFrameResize: (...args: any[]) => any

    // Child page configuration
    iframeResizer: any
    iFrameResizer: any

    // Child public API
    parentIframe: any
    parentIFrame: any

    // Same-origin message bridge
    iframeParentListener: (data: any) => void
    iframeChildListener: (data: string) => void

    // Test hook
    mockMsgListener: (...args: any[]) => any

    // AMD
    define: any

    // jQuery
    jQuery: any

    // Chrome detection
    chrome: any
  }

  interface HTMLIFrameElement {
    iframeResizer: any
    iFrameResizer: any
  }
}

export {}
