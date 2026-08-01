/**
 * Angular directive for iframe-resizer by Bjørn Håkon (https://github.com/bjornoss)
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  type SimpleChanges,
} from '@angular/core'
import { esModuleInterop } from '@iframe-resizer/common'
import { EXPAND, LOG_EXPANDED } from '@iframe-resizer/common/consts'
import type {
  IFrameComponent,
  IFrameMessageData,
  IFrameMouseData,
  IFrameObject,
  IFrameOptions,
  IFrameResizedData,
} from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'

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

  private buildOptions(): IFrameOptions {
    const { logExpand: _logExpand, ...options } = this
      .options as IFrameOptions & Record<string, unknown>
    return {
      ...options,

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

      onScroll: (event: {
        iframe: IFrameComponent
        top: number
        left: number
      }) => this.onScroll.next(event),
    } as IFrameOptions
  }

  ngAfterViewInit(): void {
    const id = this.elementRef.nativeElement?.id

    this.consoleGroup.label(`angular(${id})`)
    this.consoleGroup.event('setup')
    this.consoleGroup.expand(
      this.options.log === EXPAND || this.options.log === LOG_EXPANDED,
    )

    if (this.debug) this.consoleGroup.log('ngAfterViewInit')

    this.resizer = connectResizer(this.buildOptions())(
      this.elementRef.nativeElement,
    )
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-bind when @Input options change. Skip the first call: the binding
    // hasn't been established yet at that point — ngAfterViewInit handles it.
    if (!this.resizer) return
    if (!changes.options) return
    if (this.debug) this.consoleGroup.log('ngOnChanges: options updated')
    connectResizer(this.buildOptions())(this.elementRef.nativeElement)
  }

  ngOnDestroy(): void {
    if (this.debug) this.consoleGroup.log('ngOnDestroy')
    this.consoleGroup.endAutoGroup()
    this.resizer?.disconnect()
  }

  // parent methods
  public moveToAnchor(anchor: string): void {
    this.resizer?.moveToAnchor(anchor)
  }

  public sendMessage(message: any, targetOrigin?: string): void {
    this.resizer?.sendMessage(message, targetOrigin)
  }
}

export type * from '@iframe-resizer/core'
