import { esModuleInterop, setStyleKeepingSize } from '@iframe-resizer/common'
import { VERTICAL } from '@iframe-resizer/common/consts'
import type { IFrameObject, IFrameOptions } from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

// Map lowercase attribute names to camelCase option names
const RESIZER_ATTR_MAP: Record<string, string> = {
  license: 'license',
  bodybackground: 'bodyBackground',
  bodymargin: 'bodyMargin',
  bodypadding: 'bodyPadding',
  checkorigin: 'checkOrigin',
  direction: 'direction',
  inpagelinks: 'inPageLinks',
  log: 'log',
  offsetsize: 'offsetSize',
  scrolling: 'scrolling',
  tolerance: 'tolerance',
  waitforload: 'waitForLoad',
  warningtimeout: 'warningTimeout',
}

// Attributes that should be parsed as numbers
const NUMERIC_ATTRS = new Set([
  'bodymargin',
  'bodypadding',
  'offsetsize',
  'tolerance',
  'warningtimeout',
])

// Attributes where empty value means boolean true
const BOOLEAN_ATTRS = new Set([
  'checkorigin',
  'inpagelinks',
  'log',
  'scrolling',
  'waitforload',
])

// Attributes that should be parsed as whitespace-separated arrays
const ARRAY_ATTRS = new Set(['checkorigin'])

// Core defaults restored when a mapped attribute is removed. A removed
// attribute is simply absent from buildOptions(), and core's update path
// merges over the existing settings, so the reset has to be explicit.
// license is omitted, as removing it is not a meaningful runtime change.
const RESIZER_ATTR_DEFAULTS: Record<string, unknown> = {
  bodyBackground: null,
  bodyMargin: null,
  bodyPadding: null,
  checkOrigin: true,
  direction: VERTICAL,
  inPageLinks: false,
  log: false,
  offsetSize: 0,
  scrolling: false,
  tolerance: 0,
  waitForLoad: false,
  warningTimeout: 5000,
}

const EVENTS: Record<string, string> = {
  onReady: 'iframe-resizer:ready',
  onMessage: 'iframe-resizer:message',
  onResized: 'iframe-resizer:resized',
  onScroll: 'iframe-resizer:scroll',
  onMouseEnter: 'iframe-resizer:mouseenter',
  onMouseLeave: 'iframe-resizer:mouseleave',
}

type Callback = (data: unknown) => unknown

function parseAttrValue(
  name: string,
  value: string,
): boolean | number | string | string[] {
  if (NUMERIC_ATTRS.has(name) && value !== '') {
    const num = Number(value)
    if (!Number.isNaN(num)) return num
  }

  if (value === 'true') return true
  if (value === 'false') return false
  if (value === '' && BOOLEAN_ATTRS.has(name)) return true
  // Core only reads a list, so even a single value is passed as one
  if (ARRAY_ATTRS.has(name)) return value.trim().split(/\s+/)

  return value
}

// Fallback for SSR environments where HTMLElement is not defined
const HTMLBase =
  typeof HTMLElement === 'undefined'
    ? (function HTMLElement() {} as unknown as typeof HTMLElement)
    : HTMLElement

export class IframeResizerElement extends HTMLBase {
  private resizer: IFrameObject | null = null

  private consoleGroup = createAutoConsoleGroup()

  private resizerOptions: Partial<IFrameOptions> = {}

  private iframe: HTMLIFrameElement | null = null

  private attributeObserver: MutationObserver | null = null

  static get observedAttributes(): string[] {
    return Object.keys(RESIZER_ATTR_MAP)
  }

  get options(): Partial<IFrameOptions> {
    return this.resizerOptions
  }

  // A framework sets undefined for an unset binding, so treat that as none
  set options(val: Partial<IFrameOptions> | null | undefined) {
    this.resizerOptions = val ?? {}
    this.rebind()
  }

  get iframeResizer(): IFrameObject | null {
    return this.resizer
  }

  private buildOptions(): IFrameOptions {
    const attrOptions: Record<string, unknown> = {}
    for (const attr of this.attributes) {
      const optionName = RESIZER_ATTR_MAP[attr.name]
      if (optionName) {
        attrOptions[optionName] = parseAttrValue(attr.name, attr.value)
      }
    }

    // Each callback dispatches its event and then calls the same-named
    // callback set through the options property, if any. That callback is
    // read when core invokes the handler, so a later change is picked up
    // without re-binding. The events are cancelable and the callback's return
    // value is passed back, so either can stop a scroll as onScroll can.
    const eventHandlers: Record<string, Callback> = {}
    for (const [callback, eventName] of Object.entries(EVENTS)) {
      eventHandlers[callback] = (data: unknown) => {
        const proceed = this.dispatchEvent(
          new CustomEvent(eventName, {
            detail: data,
            bubbles: true,
            cancelable: true,
          }),
        )
        if (!proceed) return false

        const userCallback = (this.resizerOptions as Record<string, unknown>)[
          callback
        ]
        return typeof userCallback === 'function'
          ? (userCallback as Callback)(data)
          : undefined
      }
    }

    return {
      ...(attrOptions as unknown as IFrameOptions),
      ...this.resizerOptions,
      ...eventHandlers,
      // The element disconnects when it is removed from the page
      disconnectOnRemove: false,
      onBeforeClose: () => {
        this.consoleGroup.event('close')
        this.consoleGroup.warn(
          'Close event ignored, remove the <iframe-resizer> element to close.',
        )
        return false
      },
    } as IFrameOptions
  }

  // Defaults go first, so a value set through the options property still
  // wins over the default for an attribute that was removed
  private rebind(defaults: Record<string, unknown> = {}): void {
    if (!this.iframe || !this.resizer) return
    connectResizer({ ...defaults, ...this.buildOptions() })(this.iframe)
  }

  connectedCallback(): void {
    // Guard against duplicate iframes if element is moved in the DOM
    if (this.iframe?.isConnected) return

    const iframe = document.createElement('iframe')

    for (const attr of this.attributes) {
      if (!RESIZER_ATTR_MAP[attr.name]) {
        iframe.setAttribute(attr.name, attr.value)
      }
    }

    this.iframe = iframe
    this.append(iframe)
    this.watchAttributes()

    this.resizer = connectResizer(this.buildOptions())(iframe) ?? null

    this.consoleGroup.label(`web-component(${iframe.id})`)
    this.consoleGroup.event('setup')
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (oldValue === newValue) return

    const optionName = RESIZER_ATTR_MAP[name]
    if (!optionName) return

    const reset =
      newValue === null && optionName in RESIZER_ATTR_DEFAULTS
        ? { [optionName]: RESIZER_ATTR_DEFAULTS[optionName] }
        : {}

    this.rebind(reset)
  }

  disconnectedCallback(): void {
    this.attributeObserver?.disconnect()
    this.attributeObserver = null
    this.consoleGroup.endAutoGroup()
    this.resizer?.disconnect()
    this.resizer = null
    this.iframe?.remove()
    this.iframe = null
  }

  // Passes later changes to the element's other attributes, such as src, on
  // to the iframe. A new id is passed on too, so core can report that a bound
  // iframe cannot change its id
  private watchAttributes(): void {
    this.attributeObserver = new MutationObserver((mutations) => {
      for (const { attributeName: name } of mutations) {
        if (!name || RESIZER_ATTR_MAP[name]) continue

        const value = this.getAttribute(name)

        // A wholesale style write would wipe the size core set on the iframe
        if (name === 'style') {
          if (this.iframe) setStyleKeepingSize(this.iframe, value)
          continue
        }

        if (value === null) this.iframe?.removeAttribute(name)
        else this.iframe?.setAttribute(name, value)

        if (name === 'id') this.rebind()
      }
    })
    this.attributeObserver.observe(this, { attributes: true })
  }
}

// Don't run for server side render
if (
  typeof customElements !== 'undefined' &&
  !customElements.get('iframe-resizer')
) {
  customElements.define('iframe-resizer', IframeResizerElement)
}

export type * from '@iframe-resizer/core'
