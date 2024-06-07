/**
 * @fileoverview Type definitions for @iframe-resizer/child
 *
 * This is a fork of the DefinitelyTyped type definitions for iframe-resizer,
 * updated to include the new API methods/options and remove deprecated ones.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/iframe-resizer/index.d.ts
 *
 * I'm not a TypeScript dev, so please feel free to submit PRs to improve this file.
 */

declare module '@iframe-resizer/child' {
  namespace iframeResizer {
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
      getParentProps(callback: (data: ParentProps) => void): void

      /**
       * Scroll the parent page by x and y
       */
      scrollBy(x: number, y: number): void

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

    interface ParentProps {
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
  }

  global {
    interface Window {
      iFrameResizer: iframeResizer.IFramePageOptions
      parentIFrame: iframeResizer.IFramePage
    }
  }

}
