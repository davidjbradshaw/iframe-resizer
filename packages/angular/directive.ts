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
import acg from 'auto-console-group'

import { esModuleInterop } from '../common/utils'

export type { IFrameObject, IFrameComponent, IFrameOptions }

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

@Directive({
  selector: '[iframe-resizer]',
  standalone: true,
})
export class IframeResizerDirective {
  private resizer?: IFrameObject
  private consoleGroup = createAutoConsoleGroup()

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

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    const id = this.elementRef.nativeElement?.id

    this.consoleGroup.label(`angular(${id})`)
    this.consoleGroup.event('setup')

    if (this.debug) this.consoleGroup.log('ngAfterViewInit')

    this.resizer = connectResizer({
      ...this.options,
      waitForLoad: true,

      onBeforeClose: () => {
        this.consoleGroup.event('close')
        this.consoleGroup.warn(
          'Close event ignored, to remove the iframe update your Angular component.',
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
    if (this.debug) this.consoleGroup.log('ngOnDestroy')
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
