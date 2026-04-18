// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/require-default-props */
import { esModuleInterop } from '@iframe-resizer/common'
import type {
  IFrameComponent,
  IFrameObject,
  IFrameOptions,
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

import filterIframeAttribs from './filter-iframe-attribs'

export type IFrameForwardRef = Omit<IFrameObject, 'close' | 'disconnect'> & {
  getElement: () => IFrameComponent
  getRef: () => RefObject<HTMLIFrameElement | null>
}

type IframeProps = React.DetailedHTMLProps<
  React.IframeHTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
>

export type IframeResizerProps = Omit<IframeProps, 'scrolling'> &
  Omit<IFrameOptions, 'id' | 'onBeforeClose'>

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

function IframeResizer(
  props: IframeResizerProps,
  ref: React.ForwardedRef<IFrameForwardRef>,
): ReactElement {
  const { log, logExpand } = props
  const filteredProps = filterIframeAttribs(props)
  const iframeRef = useRef<IFrameComponent>(null)
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
    moveToAnchor: (anchor: string) =>
      iframeRef.current.iframeResizer.moveToAnchor(anchor),
    sendMessage: (message: any, targetOrigin?: string) => {
      iframeRef.current.iframeResizer.sendMessage(message, targetOrigin)
    },
  }))

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe {...filteredProps} ref={iframeRef} />
}

export default forwardRef<IFrameForwardRef, IframeResizerProps>(IframeResizer)

export type * from '@iframe-resizer/core'
