/**
 * @fileoverview Type definitions for iframe-resizer
 *
 * This is a fork of the DefinitelyTyped type definitions for iframe-resizer,
 * updated to include the new API methods/options and remove deprecated ones.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/iframe-resizer/index.d.ts
 *
 * I'm not a TypeScript dev, so please feel free to submit PRs to improve this file.
 */

declare namespace iframeResizer {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface IFrameObject {
    close(): void

    moveToAnchor(anchor: string): void

    removeListeners(): void

    resize(): void

    sendMessage(message: any, targetOrigin?: string): void
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface IFrameComponent extends HTMLIFrameElement {
    iFrameResizer: IFrameObject
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface IFrameOptions {
    /**
     * Override the body background style in the iFrame.
     */
    bodyBackground?: string | undefined

    /**
     * Override the default body margin style in the iFrame. A string can be any valid value for the
     * CSS margin attribute, for example '8px 3em'. A number value is converted into px.
     */
    bodyMargin?: number | string | undefined

    /**
     * Override the default body padding style in the iFrame. A string can be any valid value for the
     * CSS margin attribute, for example '8px 3em'. A number value is converted into px.
     */
    bodyPadding?: number | string | undefined

    /**
     * When set to true, only allow incoming messages from the domain listed in the src property of the iFrame tag.
     * If your iFrame navigates between different domains, ports or protocols; then you will need to
     * provide an array of URLs or disable this option.
     */
    checkOrigin?: boolean | string[] | undefined

    /**
     * Set the reszing direction of the iframe.
     */
    direction?: 'vertical' | 'horizontal' | 'none' | undefined

    /**
     * When enabled in page linking inside the iFrame and from the iFrame to the parent page will be enabled.
     */
    inPageLinks?: boolean | undefined

    /**
     * Set offset height of iFrame content.
     */
    offsetHeight?: number | undefined

    /**
     * Set offset width of iFrame content.
     */
    offsetWidth?: number | undefined

    /**
     * Enable scroll bars in iFrame.
     */
    scrolling?: boolean | 'auto' | undefined

    /**
     * Set the number of pixels the iFrame content size has to change by, before triggering a resize of the iFrame.
     */
    tolerance?: number | undefined

    /**
     * Called before iFrame is closed via parentIFrame.close() or iframe.iFrameResizer.close() methods. Returning false will prevent the iFrame from closing.
     */
    onClosed?(iframeId: string): void

    /**
     * Called when iFrame is closed via parentIFrame.close() or iframe.iframeResizer.close() methods.
     */
    onClosed?(iframeId: string): void

    /**
     * Called when pointer enters the iFrame.
     */
    onMouseEnter?(data: IFrameMouseData): void

    /**
     * Called when pointer leaves the iFrame.
     */
    onMouseLeave?(data: IFrameMouseData): void

    /**
     * Initial setup callback function.
     */
    onReady?(iframe: IFrameComponent): void

    /**
     * Receive message posted from iFrame with the parentIFrame.sendMessage() method.
     */
    onMessage?(data: IFrameMessageData): void

    /**
     * Function called after iFrame resized. Passes in messageData object containing the iFrame, height, width
     * and the type of event that triggered the iFrame to resize.
     */
    onResized?(data: IFrameResizedData): void

    /**
     * Called before the page is repositioned after a request from the iFrame, due to either an in page link,
     * or a direct request from either parentIFrame.scrollTo() or parentIFrame.scrollToOffset().
     * If this callback function returns false, it will stop the library from repositioning the page, so that
     * you can implement your own animated page scrolling instead.
     */
    onScroll?(data: IFrameScrollData): boolean
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface IFramePageOptions {
    /**
     * This option allows you to restrict the domain of the parent page,
     * to prevent other sites mimicking your parent page.
     */
    targetOrigin?: string | undefined

    /**
     * Receive message posted from the parent page with the iframe.iFrameResizer.sendMessage() method.
     */
    onMessage?(message: any): void

    /**
     * This function is called once iFrame-Resizer has been initialized after receiving a call from the parent page.
     */
    onReady?(): void
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface IFramePage {
    /**
     * Turn autoResizing of the iFrame on and off. Returns bool of current state.
     */
    autoResize(resize?: boolean): boolean

    /**
     * Remove the iFrame from the parent page.
     */
    close(): void

    /**
     * Returns the ID of the iFrame that the page is contained in.
     */
    getId(): string

    /**
     * Ask the containing page for its positioning coordinates.
     *
     * Your callback function will be recalled when the parent page is scrolled or resized.
     *
     * Pass false to disable the callback.
     */
    getParentInfo(callback: ((data: PageInfo) => void) | false): void

    /**
     * Scroll the parent page to the coordinates x and y
     */
    scrollTo(x: number, y: number): void

    /**
     * Scroll the parent page to the coordinates x and y relative to the position of the iFrame.
     */
    scrollToOffset(x: number, y: number): void

    /**
     * Send data to the containing page, message can be any data type that can be serialized into JSON. The `targetOrigin`
     * option is used to restrict where the message is sent to; to stop an attacker mimicking your parent page.
     * See the MDN documentation on postMessage for more details.
     */
    sendMessage(message: any, targetOrigin?: string): void

    /**
     * Set default target origin.
     */
    setTargetOrigin(targetOrigin: string): void

    /**
     * Manually force iFrame to resize. To use passed arguments you need first to disable the `autoResize` option to
     * prevent auto resizing and enable the `sizeWidth` option if you wish to set the width.
     */
    size(customHeight?: string, customWidth?: string): void
  }

  interface PageInfo {
    /**
     * The values returned by iframe.getBoundingClientRect()
     */
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

    /**
     * The values returned by document.documentElement.scrollWidth and document.documentElement.scrollHeight
     */
    document: {
      scrollWidth: number
      scrollHeight: number
    }

    /**
     * The values returned by window.visualViewport
     */
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

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface IFrameMouseData {
    iframe: IFrameComponent
    height: number
    width: number
    type: string
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface IFrameResizedData {
    iframe: IFrameComponent
    height: number
    width: number
    type: string
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface IFrameMessageData {
    iframe: IFrameComponent
    message: any
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface IFrameScrollData {
    x: number
    y: number
  }
  function iframeResize(
    options: IFrameOptions,
    target: string | HTMLElement,
  ): IFrameComponent[]
}

// leave this declaration outside the namespace so the 'require'd import is still callable
declare function iframeResize(
  options: iframeResizer.IFrameOptions,
  target: string | HTMLElement,
): iframeResizer.IFrameComponent[]

export = iframeResize
export as namespace iframeResizer
