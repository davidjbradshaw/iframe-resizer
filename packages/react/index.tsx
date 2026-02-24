import connectResizer from '@iframe-resizer/core'
import type {
  IFrameObject,
  IFrameComponent,
  IFrameMessageData,
  IFrameMouseData,
  IFrameResizedData,
  IFrameScrollData,
} from '@iframe-resizer/core'
import acg from 'auto-console-group'
import React, { forwardRef, type ReactElement, type RefObject, useEffect, useImperativeHandle, useRef } from 'react'

import { esModuleInterop } from '../common/utils'
import filterIframeAttribs from './filter-iframe-attribs'

export type { IFrameObject, IFrameComponent }

export type IFrameForwardRef = Omit<IFrameObject, 'close' | 'disconnect'> & {
  getElement: () => IFrameComponent
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
  direction?: 'vertical' | 'horizontal' | 'none' | 'both'
  inPageLinks?: boolean
  license: string
  log?: boolean | 'expanded' | 'collapsed'
  logExpand?: boolean
  offsetSize?: number
  scrolling?: boolean | 'omit'
  tolerance?: number
  waitForLoad?: boolean
  warningTimeout?: number
}

export type ResizerEvents = {
  onCLosed?: (iframeId: string) => void // Remove in v6
  onAfterClose?: (iframeId: string) => void
  onMessage?: (ev: IFrameMessageData) => void
  onMouseEnter?: (ev: IFrameMouseData) => void
  onMouseLeave?: (ev: IFrameMouseData) => void
  onReady?: (iframe: IFrameComponent) => void
  onResized?: (ev: IFrameResizedData) => void
  onScroll?: (ev: IFrameScrollData) => boolean
}

export type IframeResizerProps = Omit<IframeProps, 'scrolling'> &
  ResizerOptions &
  ResizerEvents

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

const IframeResizer = forwardRef<IFrameForwardRef, IframeResizerProps>(
  function IframeResizer(props, ref): ReactElement {
    const filteredProps = filterIframeAttribs(props)
    const iframeRef = useRef<IFrameComponent>(null)
    const consoleGroup = createAutoConsoleGroup()

    const onBeforeClose = () => {
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

      consoleGroup.expand(resizerOptions.logExpand)
      if (props.log) consoleGroup.log('Created React component')

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
  },
)

export default IframeResizer
