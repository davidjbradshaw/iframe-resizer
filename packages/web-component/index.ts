import { esModuleInterop } from '@iframe-resizer/common'
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
  warningtimeout: 'warningTimeout',
}

// Attributes that should be parsed as numbers
const NUMERIC_ATTRS = new Set(['offsetsize', 'tolerance', 'warningtimeout'])

const EVENT_NAMES = [
  'onReady',
  'onMessage',
  'onResized',
  'onScroll',
  'onMouseEnter',
  'onMouseLeave',
] as const

const EVENT_MAP: Record<string, string> = {
  onReady: 'iframe-resizer:ready',
  onMessage: 'iframe-resizer:message',
  onResized: 'iframe-resizer:resized',
  onScroll: 'iframe-resizer:scroll',
  onMouseEnter: 'iframe-resizer:mouseenter',
  onMouseLeave: 'iframe-resizer:mouseleave',
}

function parseAttrValue(
  name: string,
  value: string,
): boolean | number | string {
  if (NUMERIC_ATTRS.has(name)) {
    const num = Number(value)
    if (!Number.isNaN(num)) return num
  }

  if (value === '' || value === 'true') return true
  if (value === 'false') return false

  return value
}

export class IframeResizerElement extends HTMLElement {
  private resizer: IFrameObject | null = null

  // eslint-disable-next-line new-cap
  private consoleGroup = createAutoConsoleGroup()

  private resizerOptions: Partial<IFrameOptions> = {}

  private iframe: HTMLIFrameElement | null = null

  get options(): Partial<IFrameOptions> {
    return this.resizerOptions
  }

  set options(val: Partial<IFrameOptions>) {
    this.resizerOptions = val
  }

  get iframeResizer(): IFrameObject | null {
    return this.resizer
  }

  connectedCallback(): void {
    // Guard against duplicate iframes if element is moved in the DOM
    if (this.iframe) return

    const iframe = document.createElement('iframe')
    const attrOptions: Record<string, unknown> = {}

    for (const attr of this.attributes) {
      const optionName = RESIZER_ATTR_MAP[attr.name]
      if (optionName) {
        attrOptions[optionName] = parseAttrValue(attr.name, attr.value)
      } else {
        iframe.setAttribute(attr.name, attr.value)
      }
    }

    this.iframe = iframe
    this.append(iframe)

    const eventHandlers: Record<string, (data: unknown) => void> = {}

    for (const event of EVENT_NAMES) {
      eventHandlers[event] = (data: unknown) => {
        this.dispatchEvent(
          new CustomEvent(EVENT_MAP[event], {
            detail: data,
            bubbles: true,
          }),
        )
      }
    }

    this.consoleGroup.label(`web-component(${iframe.id})`)
    this.consoleGroup.event('setup')

    this.resizer =
      connectResizer({
        ...(attrOptions as unknown as IFrameOptions),
        ...this.resizerOptions,
        ...eventHandlers,
        onBeforeClose: () => {
          this.consoleGroup.event('close')
          this.consoleGroup.warn(
            'Close event ignored, remove the <iframe-resizer> element to close.',
          )
          return false
        },
      })(iframe) ?? null
  }

  disconnectedCallback(): void {
    this.consoleGroup.endAutoGroup()
    this.resizer?.disconnect()
    this.resizer = null
    this.iframe?.remove()
    this.iframe = null
  }
}

if (!customElements.get('iframe-resizer')) {
  customElements.define('iframe-resizer', IframeResizerElement)
}

export type * from '@iframe-resizer/core'
