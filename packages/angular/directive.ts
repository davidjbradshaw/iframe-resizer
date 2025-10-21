/**
 * Angular directive for iframe-resizer by Bjørn Håkon (https://github.com/bjornoss)
 */


import {
  Directive,
  EventEmitter,
  Input,
  Output,
  ElementRef,
} from '@angular/core'

import connectResizer from '@iframe-resizer/core'

export type iframeResizerObject = {
  moveToAnchor: (anchor: string) => void
  resize: () => void
  sendMessage: (message: string, targetOrigin?: string) => void
}

type iframeResizerObjectPrivateMethods = {
  disconnect: () => void
}
type iframeResizerObjectPrivate = iframeResizerObject &
  iframeResizerObjectPrivateMethods

export interface iframeResizerElement extends HTMLIFrameElement {
  iFrameResizer: iframeResizerObject
}

export type iframeResizerOptions = {
  bodyBackground?: string | null
  bodyMargin?: string | number | null
  bodyPadding?: string | number | null
  checkOrigin?: boolean | string[]
  direction?: 'vertical' | 'horizontal' | 'both' | 'none'
  inPageLinks?: boolean
  license: string
  offsetSize?: number
  scrolling?: boolean | 'omit'
  tolerance?: number
  warningTimeout?: number
}

@Directive({
  selector: '[iframe-resizer]',
  standalone: true,
})
export class IframeResizerDirective {
  private resizer?: iframeResizerObjectPrivate

  @Output() onReady = new EventEmitter<iframeResizerElement>()
  @Output() onBeforeClose = new EventEmitter<iframeResizerElement>()
  @Output() onMessage = new EventEmitter<{
    iframe: iframeResizerElement
    message: string
  }>()
  @Output() onMouseEnter = new EventEmitter<{
    iframe: iframeResizerElement
    height: number
    width: number
    type: string
  }>()
  @Output() onMouseLeave = new EventEmitter<{
    iframe: iframeResizerElement
    height: number
    width: number
    type: string
  }>()
  @Output() onResized = new EventEmitter<{
    iframe: iframeResizerElement
    height: number
    width: number
    type: string
  }>()
  @Output() onScroll = new EventEmitter<{
    iframe: iframeResizerElement
    top: number
    left: number
  }>()

  get iframeResizer(): iframeResizerObject | undefined {
    return this.resizer
  }

  @Input() options: iframeResizerOptions = {
    license: '',
  }

  @Input() debug: boolean = false

  constructor(private elementRef: ElementRef) {
    if (this.debug) console.debug('[IframeResizerDirective].constructor')
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.resizer = connectResizer({
      ...this.options,
      waitForLoad: true,

      onBeforeClose: (iframeID: any) => {
        console.warn(
          `[iframe-resizer/angular][${this.elementRef.nativeElement?.id}] Close event ignored, to remove the iframe update your Angular component.`,
        )
        return false
      },

      onMessage: (event: { iframe: iframeResizerElement; message: string }) =>
        this.onMessage.next(event),

      onMouseEnter: (event: {
        iframe: iframeResizerElement
        height: number
        width: number
        type: string
      }) => this.onMouseEnter.next(event),

      onMouseLeave: (event: {
        iframe: iframeResizerElement
        height: number
        width: number
        type: string
      }) => this.onMouseLeave.next(event),

      onReady: (iframe: iframeResizerElement) => this.onReady.next(iframe),

      onResized: (event: {
        iframe: iframeResizerElement
        height: number
        width: number
        type: string
      }) => this.onResized.next(event),

      onScroll: (event: {
        iframe: iframeResizerElement
        top: number
        left: number
      }) => this.onScroll.next(event),
    })(this.elementRef.nativeElement)
  }

  ngOnDestroy() {
    if (this.debug) console.debug('ngOnDestroy')
    this.resizer?.disconnect()
  }

  // parent methods
  public resize() {
    this.resizer?.resize()
  }
  public moveToAnchor(anchor: string) {
    this.resizer?.moveToAnchor(anchor)
  }

  public sendMessage(message: string, targetOrigin?: string) {
    this.resizer?.sendMessage(message, targetOrigin)
  }
}
