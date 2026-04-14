// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/require-default-props */
import { esModuleInterop } from '@iframe-resizer/common'
import type {
  IframeComponent,
  IframeObject,
  IframeOptions,
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

export type IframeForwardRef = Omit<IframeObject, 'close' | 'disconnect'> & {
  getElement: () => IframeComponent
  getRef: () => RefObject<HTMLIFrameElement | null>
}

type IframeProps = React.DetailedHTMLProps<
  React.IframeHTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
>

export type IframeResizerProps = Omit<IframeProps, 'scrolling'> &
  Omit<IframeOptions, 'id' | 'onBeforeClose'>

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
    moveToAnchor: (anchor: string) =>
      iframeRef.current.iframeResizer.moveToAnchor(anchor),
    sendMessage: (message: any, targetOrigin?: string) => {
      iframeRef.current.iframeResizer.sendMessage(message, targetOrigin)
    },
  }))

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe {...filteredProps} ref={iframeRef} />
}

export default forwardRef<IframeForwardRef, IframeResizerProps>(IframeResizer)

export {
  type IframeComponent,
  type IframeDirection,
  type IframeLogOption,
  type IframeMessageData,
  type IframeMouseData,
  type IframeObject,
  type IframeOptions,
  type IframeResizedData,
  type IframeScrollData,
  type IframeScrollOption,
} from '@iframe-resizer/core'
