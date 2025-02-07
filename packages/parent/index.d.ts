/**
 * @fileoverview Type definitions for @iframe-resizer/parent
 *
 * This is a fork of the DefinitelyTyped type definitions for iframe-resizer,
 * updated to include the new API methods/options and remove deprecated ones.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/iframe-resizer/index.d.ts
 *
 * I'm not a TypeScript dev, so please feel free to submit PRs to improve this file.
 */

declare module '@iframe-resizer/parent' {

  namespace iframeResizer {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface IFrameObject {
      close(): void

      moveToAnchor(anchor: string): void

      disconnect(): void

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
       * Custom iframe id
       */
      id?: string

      /**
       * When enabled in page linking inside the iFrame and from the iFrame to the parent page will be enabled.
       */
      inPageLinks?: boolean | undefined

      /**
       * Set iFrame-resizer license.
       */
      license: string
      /**
       * Enable/disable logs
       */
      log?: boolean
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

      waitForLoad?: boolean | undefined

      warningTimeout?: number | undefined

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
  function iframeResize(
    options: iframeResizer.IFrameOptions,
    target: string | HTMLElement,
  ): iframeResizer.IFrameComponent[]

  export default iframeResize;
  export { IFrameComponent, IFrameObject };
}
