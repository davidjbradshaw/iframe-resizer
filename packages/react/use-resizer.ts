import { esModuleInterop } from '@iframe-resizer/common'
import type { IFrameComponent } from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import { useEffect, useRef } from 'react'

import type { IFrameResizerProps } from './types'

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

export default function useResizer(props: IFrameResizerProps) {
  const { log, logExpand } = props
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

    const resizer = connectResizer({ ...props, onBeforeClose })(iframe)

    consoleGroup.label(`react(${iframe.id})`)
    consoleGroup.event('setup')

    consoleGroup.expand(logExpand)
    if (log) consoleGroup.log('Created React component')

    return () => {
      consoleGroup.endAutoGroup()
      resizer?.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return iframeRef
}
