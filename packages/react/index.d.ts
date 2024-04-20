import * as React from 'react'

export type IFrameObject = {
  close: () => void
  moveToAnchor: (anchor: string) => void
  resize: () => void
  sendMessage: (message: any, targetOrigin?: string) => void
  removeListeners: () => void
}
export interface IFrameComponent extends HTMLIFrameElement {
  iFrameResizer: IFrameObject
}

export type IframeProps = React.DetailedHTMLProps<
  React.IframeHTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
>

export type ResizerOptions = {
  bodyBackground?: string | null
  bodyMargin?: string | number | null
  bodyPadding?: string | number | null
  checkOrigin?: boolean | string[]
  direction?: 'vertical' | 'horizontal' | 'none'
  forwardRef?: any
  inPageLinks?: boolean
  enablePublicMethods?: boolean
  offsetHeight?: number
  offsetWidth?: number
  scrolling?: boolean | 'omit'
  tolerance?: number
}

export type ResizerEvents = {
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

export type IframeResizerProps = Omit<IframeProps, 'scrolling'> &
  ResizerOptions &
  ResizerEvents

export default function IframeResizer(
  props: IframeResizerProps,
): React.ReactElement
