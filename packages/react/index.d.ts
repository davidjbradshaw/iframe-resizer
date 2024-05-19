/**
 * @fileoverview Type definitions for @iframe-resizer/react
 *
 * I'm not a TypeScript dev, so please feel free to submit PRs to improve this file.
 */

declare module '@iframe-resizer/react' {
  import * as React from 'react'

  namespace IframeResizer {
    type IFrameObject = {
      moveToAnchor: (anchor: string) => void
      resize: () => void
      sendMessage: (message: string, targetOrigin?: string) => void
    }

    interface IFrameComponent extends HTMLIFrameElement {
      iFrameResizer: IFrameObject
    }

    type IFrameForwardRef = Omit<IFrameObject, 'close' | 'disconnect'> & {
      getElement: () => IFrameComponent
      getRef: () => any
    }

    type IframeProps = React.DetailedHTMLProps<
      React.IframeHTMLAttributes<HTMLIFrameElement>,
      HTMLIFrameElement
    >

    type ResizerOptions = {
      bodyBackground?: string | null
      bodyMargin?: string | number | null
      bodyPadding?: string | number | null
      checkOrigin?: boolean | string[]
      direction?: 'vertical' | 'horizontal' | 'none'
      forwardRef?: any
      inPageLinks?: boolean
      license: string
      offset?: number
      scrolling?: boolean | 'omit'
      tolerance?: number
      warningTimeout?: number
    }

    type ResizerEvents = {
      onInit?: (iframe: IFrameComponent) => void
      onMessage?: (ev: { iframe: IFrameComponent; message: any }) => void
      onResized?: (ev: {
        iframe: IFrameComponent
        height: number
        width: number
        type: string
      }) => void
      onScroll?: (ev: { x: number; y: number }) => boolean
    }

    type IframeResizerProps = Omit<IframeProps, 'scrolling'> &
      ResizerOptions &
      ResizerEvents
  }

  function IframeResizer(
    props: IframeResizer.IframeResizerProps,
  ): React.ReactElement

  export = IframeResizer
}
