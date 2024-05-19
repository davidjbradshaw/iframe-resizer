import connectResizer from '@iframe-resizer/core'
import React, { useEffect, useImperativeHandle, useRef } from 'react'
import warning from 'warning'

import filterIframeAttribs from './filter-iframe-attribs'

function IframeResizer(props) {
  // eslint-disable-next-line react/prop-types
  const { title = 'iframe', forwardRef, ...rest } = props
  const iframeProps = filterIframeAttribs(rest)
  const iframeRef = useRef(null)

  const onClose = () => {
    warning(
      !iframeRef.current,
      `[iframeSizerReact][${iframeRef?.current?.id}] Close event ignored, to remove the iframe update your React component`,
    )
    return !iframeRef.current
  }

  // This hook is only run once, as once iframeResizer is bound, it will
  // deal with changes to the element and does not need recalling
  useEffect(() => {
    const iframe = iframeRef.current
    const resizer = connectResizer({ ...rest, onClose })(iframe)
    return () => resizer?.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(forwardRef, () => ({
    getRef: () => iframeRef,
    getElement: () => iframeRef.current,
    getIframeElement: () => iframeRef.current,
    resize: () => iframeRef.current.iframeResizer.resize(),
    moveToAnchor: (anchor) =>
      iframeRef.current.iframeResizer.moveToAnchor(anchor),
    sendMessage: (message, targetOrigin) => {
      iframeRef.current.iframeResizer.sendMessage(message, targetOrigin)
    },
  }))

  return <iframe title={title} {...iframeProps} ref={iframeRef} />
}

export default IframeResizer
