import { esModuleInterop } from '@iframe-resizer/common'
import { EXPAND, LOG_EXPANDED } from '@iframe-resizer/common/consts'
import type { IFrameComponent, IFrameOptions } from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import { useCallback, useEffect, useRef } from 'react'

import buildOptionsKey from './options-key'
import type { IFrameResizerProps } from './types'

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

// User callbacks that core stores in settings and invokes later. Each is
// passed to core as a stable wrapper that calls the latest prop, so a new
// closure on re-render is picked up without re-binding. onAfterClose is not
// included as close is ignored in React (onBeforeClose returns false).
const CALLBACKS = [
  'onMessage',
  'onMouseEnter',
  'onMouseLeave',
  'onReady',
  'onResized',
  'onScroll',
] as const

type Callback = (typeof CALLBACKS)[number]
type Wrapper = (...args: unknown[]) => unknown

export default function useResizer(props: IFrameResizerProps) {
  const { log } = props
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

  // Latest props and onBeforeClose are read through refs so the effects
  // below don't need them as deps and don't re-fire on unrelated re-renders.
  const propsRef = useRef(props)
  const onBeforeCloseRef = useRef(onBeforeClose)
  propsRef.current = props
  onBeforeCloseRef.current = onBeforeClose

  const wrappersRef = useRef<Partial<Record<Callback, Wrapper>>>({})

  const buildOptions = useCallback((): IFrameOptions => {
    const { logExpand: _logExpand, ...coreProps } = propsRef.current
    const options: IFrameOptions = {
      ...coreProps,
      onBeforeClose: onBeforeCloseRef.current,
    }
    const callbacks = options as Partial<Record<Callback, Wrapper>>

    for (const name of CALLBACKS) {
      if (typeof propsRef.current[name] === 'function') {
        wrappersRef.current[name] ??= (...args) =>
          (propsRef.current[name] as Wrapper | undefined)?.(...args)
        callbacks[name] = wrappersRef.current[name]
      } else {
        delete callbacks[name]
      }
    }

    return options
  }, [])

  // First mount: establish the iframe-resizer binding and clean up on unmount.
  useEffect(() => {
    const iframe = iframeRef.current

    consoleGroup.label(`react(${iframe.id})`)
    consoleGroup.event('setup')

    const resizer = connectResizer(buildOptions())(iframe)

    consoleGroup.expand(log === EXPAND || log === LOG_EXPANDED)
    if (log) consoleGroup.log('Created React component')

    return () => {
      consoleGroup.endAutoGroup()
      resizer?.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-bind when iframe-resizer-relevant props change. The first mount above
  // already created the binding, so subsequent calls take the update path in
  // core, which sends an UPDATE message to the child.
  //
  // optionsKey is a stable serialization of the props the resizer cares
  // about, including which callbacks are present (but not their identity,
  // which the wrappers absorb), so this doesn't re-fire on every render.
  const optionsKey = buildOptionsKey(props)
  const isFirstUpdateRef = useRef(true)

  useEffect(() => {
    if (isFirstUpdateRef.current) {
      isFirstUpdateRef.current = false
      return
    }

    const iframe = iframeRef.current
    if (!iframe) return

    connectResizer(buildOptions())(iframe)
  }, [optionsKey, buildOptions])

  return iframeRef
}
