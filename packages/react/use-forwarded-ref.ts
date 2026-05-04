import type { IFrameComponent } from '@iframe-resizer/core'
import { type ForwardedRef, type RefObject, useImperativeHandle } from 'react'

import type { IFrameForwardRef } from './types'

export default function useForwardedRef(
  ref: ForwardedRef<IFrameForwardRef>,
  iframeRef: RefObject<IFrameComponent>,
) {
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
    [iframeRef],
  )
}
