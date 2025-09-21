/**
 * @fileoverview Type definitions for @iframe-resizer/react
 *
 * I'm not a TypeScript dev, so please feel free to submit PRs to improve this file.
 */
declare module '@iframe-resizer/react' {
  import * as React from 'react'
  import type {
    IFrameComponent,
    IFrameObject,
    ResizerEvents,
    ResizerOptions,
  } from '@iframe-resizer/core'

  type IframeProps = React.DetailedHTMLProps<
    React.IframeHTMLAttributes<HTMLIFrameElement>,
    HTMLIFrameElement
  >

  // Combined Props for React component
  type IframeResizerProps = Omit<IframeProps, 'scrolling'> &
    ResizerOptions &
    ResizerEvents & {
      forwardRef?: any
      id?: string
    }

  // Forward Ref type for React
  type IFrameForwardRef = Omit<IFrameObject, 'close' | 'disconnect'> & {
    getElement: () => IFrameComponent
    getRef: () => any
  }

  function IframeResizer(props: IframeResizerProps): React.ReactElement

  export = IframeResizer
}
