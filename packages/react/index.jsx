import connectResizer from '@iframe-resizer/core'
import React, { useEffect, useImperativeHandle, useRef } from 'react'

import filterIframeAttribs from '../common/filter-iframe-attribs'

// TODO: Add support for React.forwardRef() in next major version (Breaking change)
function IframeResizer(props) {
  // eslint-disable-next-line react/prop-types
  const { forwardRef, ...rest } = props
  const filteredProps = filterIframeAttribs(rest)
  const iframeRef = useRef(null)

  const onClose = () => {
    if (!iframeRef.current)
      // eslint-disable-next-line no-console
      console.warn(
        `[iframe-resizer/react][${iframeRef?.current?.id}] Close event ignored, to remove the iframe update your React component.`,
      )

    return !iframeRef.current // Allow React to close this
  }

  // This hook is only run once, as once iframe-resizer is bound, it will
  // deal with changes to the element and does not need recalling
  useEffect(() => {
    const iframe = iframeRef.current
    const resizer = connectResizer({ ...rest, onClose })(iframe)
    return () => resizer?.disconnect()
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
