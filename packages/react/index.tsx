// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/require-default-props */
import React, { forwardRef, type ReactElement } from 'react'

import filterIframeAttribs from './filter-iframe-attribs'
import type { IFrameForwardRef, IFrameResizerProps } from './types'
import useForwardedRef from './use-forwarded-ref'
import useResizer from './use-resizer'

export type { IFrameForwardRef, IFrameResizerProps } from './types'

function IframeResizer(
  props: IFrameResizerProps,
  ref: React.ForwardedRef<IFrameForwardRef>,
): ReactElement {
  const filteredProps = filterIframeAttribs(props)
  const iframeRef = useResizer(props)

  useForwardedRef(ref, iframeRef)

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe {...filteredProps} ref={iframeRef} />
}

export default forwardRef<IFrameForwardRef, IFrameResizerProps>(IframeResizer)

export type * from '@iframe-resizer/core'
