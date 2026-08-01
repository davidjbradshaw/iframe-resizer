// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/require-default-props */
import { esModuleInterop } from '@iframe-resizer/common'
import type { IFrameComponent } from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import React, {
  forwardRef,
  type ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

import filterIframeAttribs from './filter-iframe-attribs'
import type { IFrameForwardRef, IFrameResizerProps } from './types'

export type { IFrameForwardRef, IFrameResizerProps } from './types'

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

function IframeResizer(
  props: IFrameResizerProps,
  ref: React.ForwardedRef<IFrameForwardRef>,
): ReactElement {
  const { log, logExpand } = props
  const filteredProps = filterIframeAttribs(props)
  const iframeRef = useRef<IFrameComponent>(null)
  const consoleGroupRef =
    useRef<ReturnType<typeof createAutoConsoleGroup>>(null)

  if (!consoleGroupRef.current) {
    consoleGroupRef.current = createAutoConsoleGroup()
  }

  const consoleGroup = consoleGroupRef.current

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

    consoleGroup.label(`react(${iframe.id})`)
    consoleGroup.event('setup')

    const resizer = connectResizer({ ...props, onBeforeClose })(iframe)

    consoleGroup.expand(logExpand)
    if (log) consoleGroup.log('Created React component')

    return () => {
      consoleGroup.endAutoGroup()
      resizer?.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(
    ref,
    () => ({
      getRef: () => iframeRef,
      getElement: () => iframeRef.current,
      getVersion: () => iframeRef.current.iframeResizer.getVersion(),
      moveToAnchor: (anchor: string) =>
        iframeRef.current.iframeResizer.moveToAnchor(anchor),
      sendMessage: (message: any, targetOrigin?: string) => {
        iframeRef.current.iframeResizer.sendMessage(message, targetOrigin)
      },
    }),
    [],
  )

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe {...filteredProps} ref={iframeRef} />
}

export default forwardRef<IFrameForwardRef, IFrameResizerProps>(IframeResizer)

export type * from '@iframe-resizer/core'
