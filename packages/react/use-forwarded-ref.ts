import type { IFrameComponent } from '@iframe-resizer/core'
import { type ForwardedRef, type RefObject, useImperativeHandle } from 'react'

import type { IFrameForwardRef } from './types'

export default function useForwardedRef(
  ref: ForwardedRef<IFrameForwardRef>,
  iframeRef: RefObject<IFrameComponent>,
) {
  const getIframeResizer = () => {
    const iframeResizer = iframeRef.current?.iframeResizer

    if (!iframeResizer) {
      throw new Error(
        'iframe-resizer instance is not available yet. Make sure the iframe is mounted and initialized before calling imperative methods.',
      )
    }

    return iframeResizer
  }

  useImperativeHandle(
    ref,
    () => ({
      getRef: () => iframeRef,
      getElement: () => iframeRef.current,
      getVersion: () => getIframeResizer().getVersion(),
      moveToAnchor: (anchor: string) => getIframeResizer().moveToAnchor(anchor),
      sendMessage: (message: any, targetOrigin?: string) => {
        getIframeResizer().sendMessage(message, targetOrigin)
      },
    }),
    [iframeRef],
  )
}
