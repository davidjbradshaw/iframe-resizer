import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'
import connectResizer from '@iframe-resizer/core'
import type {
  IFrameComponent,
  IFrameMessageData,
  IFrameMouseData,
  IFrameObject,
  IFrameOptions,
  IFrameResizedData,
} from '@iframe-resizer/core'

@Directive({
  selector: '[iframe-resizer]',
  standalone: true,
})
export class IframeResizerDirective {
  private resizer?: IFrameObject

  @Output() onReady = new EventEmitter<IFrameComponent>()
  @Output() onBeforeClose = new EventEmitter<IFrameComponent>()
  @Output() onMessage = new EventEmitter<IFrameMessageData>()
  @Output() onResized = new EventEmitter<IFrameResizedData>()
  @Output() onScroll = new EventEmitter<{
    iframe: IFrameComponent
    top: number
    left: number
  }>()

  @Input() options: IFrameOptions = { license: '' }

  get iframeResizer(): IFrameObject | undefined {
    return this.resizer
  }

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.resizer = connectResizer({
      ...this.options,
      waitForLoad: true,
      onBeforeClose: () => {
        this.onBeforeClose.next(this.elementRef.nativeElement)
        return false
      },
      onMessage: (event: IFrameMessageData) => this.onMessage.next(event),
      onReady: (iframe: IFrameComponent) => this.onReady.next(iframe),
      onResized: (event: IFrameResizedData) => this.onResized.next(event),
      onScroll: (event: {
        iframe: IFrameComponent
        top: number
        left: number
      }) => this.onScroll.next(event),
    })(this.elementRef.nativeElement)
  }

  ngOnDestroy(): void {
    this.resizer?.disconnect()
  }

  public moveToAnchor(anchor: string): void {
    this.resizer?.moveToAnchor(anchor)
  }

  public sendMessage(message: any, targetOrigin?: string): void {
    this.resizer?.sendMessage(message, targetOrigin)
  }
}
