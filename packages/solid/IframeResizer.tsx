import { esModuleInterop, setStyleKeepingSize } from '@iframe-resizer/common'
import { EXPAND, LOG_EXPANDED } from '@iframe-resizer/common/consts'
import type { IFrameComponent, IFrameOptions } from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import type { JSX } from 'solid-js'
import {
  createEffect,
  createMemo,
  createRenderEffect,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
  untrack,
} from 'solid-js'
import { isServer } from 'solid-js/web'

import type { IFrameResizerProps } from './types'
import pickWireOptions from './wire-options'

export type { IFrameResizerMethods, IFrameResizerProps } from './types'

const createAutoConsoleGroup = esModuleInterop(acg)

// User callbacks core stores in settings and invokes later
const CALLBACKS = [
  'onReady',
  'onMessage',
  'onResized',
  'onScroll',
  'onMouseEnter',
  'onMouseLeave',
] as const

const RESIZER_KEYS = [
  'license',
  'bodyBackground',
  'bodyMargin',
  'bodyPadding',
  'checkOrigin',
  'direction',
  'inPageLinks',
  'log',
  'offsetSize',
  'scrolling',
  'tolerance',
  'warningTimeout',
  ...CALLBACKS,
  'ref',
] as const

type Callback = (...args: unknown[]) => unknown

type StyleProp = JSX.CSSProperties | string | undefined

// Touches only the properties whose value changed, so core's size survives
function applyStyleObject(
  el: HTMLElement,
  value: Record<string, unknown>,
  previous: Record<string, unknown>,
): void {
  for (const name of Object.keys(previous)) {
    if (!(name in value)) el.style.removeProperty(name)
  }

  for (const [name, v] of Object.entries(value)) {
    if (v !== previous[name])
      el.style.setProperty(name, v == null ? '' : `${v}`)
  }
}

// Solid re-sets every property of a style object whenever an element's props
// are re-assigned, which would overwrite the size iframe-resizer has set on
// the iframe with the size the page started it at. So the style prop is
// applied here instead. Returns the value to pass back as prev on the next
// call.
function applyStyle(
  el: HTMLElement,
  value: StyleProp,
  prev: StyleProp,
): StyleProp {
  if (value === prev) return prev

  // A string, or anything falsy, goes through the browser's own parser, which
  // keeps the forms a parsed diff loses, such as var() inside a shorthand
  if (typeof value !== 'object' || value === null) {
    setStyleKeepingSize(el, typeof value === 'string' ? value : '')
    return value
  }

  // A previous string is cleared wholesale, so the object starts clean
  if (typeof prev === 'string') setStyleKeepingSize(el, '')

  applyStyleObject(
    el,
    value as Record<string, unknown>,
    (typeof prev === 'object' && prev !== null ? prev : {}) as Record<
      string,
      unknown
    >,
  )

  // A copy, so a style object mutated in place still diffs against what was
  // applied last time
  return { ...value }
}

export default function IframeResizer(props: IFrameResizerProps): JSX.Element {
  let iframeEl!: IFrameComponent
  const [local, styleProp, iframeProps] = splitProps(props, RESIZER_KEYS, [
    'style',
  ])
  const consoleGroup = createAutoConsoleGroup()

  const onBeforeClose = (): boolean => {
    consoleGroup.warn(
      'Close method is disabled, use Solid to remove the iframe.',
    )
    return false
  }

  // Each callback is passed to core as a wrapper that reads the current prop
  // when invoked, so a changed callback is used without re-binding. Only
  // callbacks that are present are passed: core enables mouse events on the
  // presence of the mouse handlers. Core keeps a wrapper once bound, so it
  // must tolerate the prop being removed later.
  const callbackOptions = (): Partial<IFrameOptions> =>
    Object.fromEntries(
      CALLBACKS.filter((name) => typeof local[name] === 'function').map(
        (name) => [
          name,
          (...args: unknown[]) =>
            untrack(() => local[name] as Callback | undefined)?.(...args),
        ],
      ),
    )

  // Which callbacks are present (not their identity); adding or removing
  // one re-binds so core's settings gain or lose the wrapper
  const callbackPresence = createMemo(() =>
    CALLBACKS.map((name) => typeof local[name] === 'function').join(','),
  )

  const buildOptions = (): IFrameOptions => ({
    ...pickWireOptions(local),
    onBeforeClose,
    ...callbackOptions(),
  })

  onMount(() => {
    // eslint-disable-next-line solid/reactivity -- ref is a one-shot setter
    const { ref: setRef } = local

    consoleGroup.label(`solid(${iframeEl.id})`)
    consoleGroup.event('setup')

    const resizer = connectResizer(buildOptions())(iframeEl)

    consoleGroup.expand(local.log === EXPAND || local.log === LOG_EXPANDED)
    if (local.log) consoleGroup.log('Created Solid component')

    if (typeof setRef === 'function') {
      setRef({
        getElement: () => iframeEl,
        moveToAnchor: (anchor) => resizer?.moveToAnchor(anchor),
        sendMessage: (message, targetOrigin) =>
          resizer?.sendMessage(message, targetOrigin),
      })
    }

    onCleanup(() => {
      consoleGroup.endAutoGroup()
      resizer?.disconnect()
    })
  })

  // Re-bind when iframe-resizer-relevant props change. The first call inside
  // onMount establishes the binding; this effect tracks subsequent changes
  // and routes through the update path in core. It tracks the wire options
  // and callback presence only; the options are then built untracked so a
  // new callback identity does not re-run it.
  let isFirstUpdate = true
  // Reading the id tracks it, so a changed id re-binds and core can report
  // that a bound iframe cannot change its id
  const trackBindId = (props: { id?: string }): string | undefined => props.id

  createEffect(() => {
    pickWireOptions(local)
    callbackPresence()
    trackBindId(iframeProps)

    if (isFirstUpdate) {
      isFirstUpdate = false
      return
    }
    if (!iframeEl) return

    connectResizer(untrack(buildOptions))(iframeEl)
  })

  // The server has no element to style, so the style is merged back into the
  // markup there; the client keeps it out of the spread and applies it below
  const serverAttrs = mergeProps(iframeProps, styleProp)
  const attrs = isServer ? serverAttrs : iframeProps
  // eslint-disable-next-line jsx-a11y/iframe-has-title
  const iframe = <iframe {...attrs} ref={iframeEl} />

  if (!isServer) {
    let prevStyle: StyleProp
    createRenderEffect(() => {
      prevStyle = applyStyle(iframeEl, styleProp.style, prevStyle)
    })
  }

  return iframe
}
