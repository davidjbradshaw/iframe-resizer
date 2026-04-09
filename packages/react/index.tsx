// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/require-default-props */
import type {
  Direction,
  IframeComponent,
  IframeMessageData,
  IframeMouseData,
  IframeObject,
  IframeResizedData,
  IframeScrollData,
  LogOption,
  ScrollOption,
} from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import React, {
  forwardRef,
  type ReactElement,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

import { esModuleInterop } from '../common/utils'
import filterIframeAttribs from './filter-iframe-attribs'

export type IframeForwardRef = Omit<IframeObject, 'close' | 'disconnect'> & {
  getElement: () => IframeComponent
  getRef: () => RefObject<HTMLIFrameElement | null>
}

type IframeProps = React.DetailedHTMLProps<
  React.IframeHTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
>

export type ResizerOptions = {
  bodyBackground?: string | null
  bodyMargin?: string | number | null
  bodyPadding?: string | number | null
  checkOrigin?: boolean | string[]
  direction?: Direction
  inPageLinks?: boolean
  license: string
  log?: LogOption
  logExpand?: boolean
  offsetSize?: number
  scrolling?: ScrollOption
  tolerance?: number
  waitForLoad?: boolean
  warningTimeout?: number
}

export type ResizerEvents = {
  onAfterClose?: (iframeId: string) => void
  onMessage?: (ev: IframeMessageData) => void
  onMouseEnter?: (ev: IframeMouseData) => void
  onMouseLeave?: (ev: IframeMouseData) => void
  onReady?: (iframe: IframeComponent) => void
  onResized?: (ev: IframeResizedData) => void
  onScroll?: (ev: IframeScrollData) => boolean
}

export type IframeResizerProps = Omit<IframeProps, 'scrolling'> &
  ResizerOptions &
  ResizerEvents

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

function IframeResizer(
  props: IframeResizerProps,
  ref: React.ForwardedRef<IframeForwardRef>,
): ReactElement {
  const { log, logExpand } = props
  const filteredProps = filterIframeAttribs(props)
  const iframeRef = useRef<IframeComponent>(null)
  const consoleGroup = createAutoConsoleGroup()

  const onBeforeClose = (): boolean => {
    consoleGroup.event('close')
    consoleGroup.warn(
      `Close event ignored, to remove the iframe update your React component.`,
    )

    return false
  }

  // This hook is only run once, as once iframe-resizer is bound, it will
  // deal with changes to the element and does not need recalling
  useEffect(() => {
    const iframe = iframeRef.current
    const resizerOptions = { ...props, onBeforeClose }

    consoleGroup.label(`react(${iframe.id})`)
    consoleGroup.event('setup')

    const resizer = connectResizer(resizerOptions)(iframe)

    consoleGroup.expand(logExpand)
    if (log) consoleGroup.log('Created React component')

    return () => {
      consoleGroup.endAutoGroup()
      resizer?.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    getRef: () => iframeRef,
    getElement: () => iframeRef.current,
    resize: () => iframeRef.current.iframeResizer.resize(),
    moveToAnchor: (anchor: string) =>
      iframeRef.current.iframeResizer.moveToAnchor(anchor),
    sendMessage: (message: string, targetOrigin?: string) => {
      iframeRef.current.iframeResizer.sendMessage(message, targetOrigin)
    },
  }))

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe {...filteredProps} ref={iframeRef} />
}

export default forwardRef<IframeForwardRef, IframeResizerProps>(IframeResizer)

export { type IframeComponent, type IframeObject } from '@iframe-resizer/core'
