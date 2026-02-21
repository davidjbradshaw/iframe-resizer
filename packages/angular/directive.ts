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
import type {
  IFrameObject,
  IFrameComponent,
  IFrameMessageData,
  IFrameMouseData,
  IFrameResizedData,
  IFrameOptions,
} from '@iframe-resizer/core'

export type { IFrameObject, IFrameComponent, IFrameOptions }

@Directive({
  selector: '[iframe-resizer]',
  standalone: true,
})
export class IframeResizerDirective {
  private resizer?: IFrameObject

  @Output() onReady = new EventEmitter<IFrameComponent>()
  @Output() onBeforeClose = new EventEmitter<IFrameComponent>()
  @Output() onMessage = new EventEmitter<IFrameMessageData>()
  @Output() onMouseEnter = new EventEmitter<IFrameMouseData>()
  @Output() onMouseLeave = new EventEmitter<IFrameMouseData>()
  @Output() onResized = new EventEmitter<IFrameResizedData>()
  @Output() onScroll = new EventEmitter<{
    iframe: IFrameComponent
    top: number
    left: number
  }>()

  get iframeResizer(): IFrameObject | undefined {
    return this.resizer
  }

  @Input() options: IFrameOptions = {
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

      onMessage: (event: IFrameMessageData) => this.onMessage.next(event),

      onMouseEnter: (event: IFrameMouseData) => this.onMouseEnter.next(event),

      onMouseLeave: (event: IFrameMouseData) => this.onMouseLeave.next(event),

      onReady: (iframe: IFrameComponent) => this.onReady.next(iframe),

      onResized: (event: IFrameResizedData) => this.onResized.next(event),

      onScroll: (event: { iframe: IFrameComponent; top: number; left: number }) =>
        this.onScroll.next(event),
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
