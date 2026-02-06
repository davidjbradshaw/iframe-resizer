/**
 * @fileoverview Type definitions for @iframe-resizer/vue/sfc
 *
 * I'm not a TypeScript dev, so please feel free to submit PRs to improve this file.
 */

declare module '@iframe-resizer/vue/sfc' {
  import { DefineComponent, IframeHTMLAttributes } from 'vue'

  export interface IFrameObject {
    moveToAnchor: (anchor: string) => void
    resize: () => void
    sendMessage: (message: string, targetOrigin?: string) => void
  }

  export interface IFrameComponent extends HTMLIFrameElement {
    iFrameResizer: IFrameObject
  }

  export interface IframeResizerProps {
    // Required
    license: string

    // Options
    bodyBackground?: string
    bodyMargin?: string | number
    bodyPadding?: string | number
    checkOrigin?: boolean | string[]
    direction?: 'vertical' | 'horizontal' | 'none' | 'both'
    inPageLinks?: boolean
    log?: boolean | 'expanded' | 'collapsed' | number
    offset?: number
    scrolling?: boolean
    tolerance?: number
    warningTimeout?: number

    // Events
    onReady?: (iframe: IFrameComponent) => void
    onMessage?: (data: { iframe: IFrameComponent; message: any }) => void
    onResized?: (data: {
      iframe: IFrameComponent
      height: number
      width: number
      type: string
    }) => void
  }

  type IframeResizerComponent = DefineComponent<
    IframeResizerProps & IframeHTMLAttributes,
    {
      moveToAnchor: (anchor: string) => void
      resize: () => void
      sendMessage: (message: string, targetOrigin?: string) => void
    }
  >

  const IframeResizer: IframeResizerComponent

  export default IframeResizer
}
