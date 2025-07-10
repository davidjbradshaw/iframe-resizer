import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import React, { useEffect, useImperativeHandle, useRef } from 'react'

import filterIframeAttribs from '../common/filter-iframe-attribs'
import { esModuleInterop } from '../common/utils'

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

// TODO: Add support for React.forwardRef() in next major version (Breaking change)
function IframeResizer(props) {
  // eslint-disable-next-line react/prop-types
  const { forwardRef, ...rest } = props
  const filteredProps = filterIframeAttribs(rest)
  const iframeRef = useRef(null)
  const consoleGroup = createAutoConsoleGroup()

  const onBeforeClose = () => {
    consoleGroup.event('Blocked Close Event')
    consoleGroup.warn(
      `Close event ignored, to remove the iframe update your React component.`,
    )

    return false
  }

  // This hook is only run once, as once iframe-resizer is bound, it will
  // deal with changes to the element and does not need recalling
  useEffect(() => {
    const iframe = iframeRef.current
    const resizerOptions = { ...rest, onBeforeClose }

    consoleGroup.label(`react(${iframe.id})`)
    consoleGroup.event('setup')

    const resizer = connectResizer(resizerOptions)(iframe)

    consoleGroup.expand(resizerOptions.logExpand)
    if (rest.log) consoleGroup.log('Created React component')

    return () => {
      consoleGroup.endAutoGroup()
      resizer?.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(forwardRef, () => ({
    getRef: () => iframeRef,
    getElement: () => iframeRef.current,
    resize: () => iframeRef.current.iframeResizer.resize(),
    moveToAnchor: (anchor) =>
      iframeRef.current.iframeResizer.moveToAnchor(anchor),
    sendMessage: (message, targetOrigin) => {
      iframeRef.current.iframeResizer.sendMessage(message, targetOrigin)
    },
  }))

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe {...filteredProps} ref={iframeRef} />
}

export default IframeResizer
