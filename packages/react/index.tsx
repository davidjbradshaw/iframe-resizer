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
import buildOptionsKey from './options-key'
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

  // First mount: establish the iframe-resizer binding and clean up on unmount.
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

  // Re-bind when iframe-resizer-relevant props change. The first mount above
  // already created the binding, so subsequent calls take the update path in
  // core, which sends an UPDATE message to the child.
  const optionsKey = buildOptionsKey(props)
  const isFirstUpdateRef = useRef(true)
  useEffect(() => {
    if (isFirstUpdateRef.current) {
      isFirstUpdateRef.current = false
      return
    }
    const iframe = iframeRef.current
    if (!iframe) return
    connectResizer({ ...props, onBeforeClose })(iframe)
  }, [optionsKey]) // eslint-disable-line react-hooks/exhaustive-deps

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
