/**
 * Angular directive for iframe-resizer by Bjørn Håkon (https://github.com/bjornoss)
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'
import type {
  IframeComponent,
  IframeMessageData,
  IframeMouseData,
  IframeObject,
  IframeOptions,
  IframeResizedData,
} from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'

import { esModuleInterop } from '../common/utils'

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)

@Directive({
  selector: '[iframe-resizer]',
  standalone: true,
})
export class IframeResizerDirective {
  private resizer?: IframeObject

  private consoleGroup = createAutoConsoleGroup()

  @Output() onReady = new EventEmitter<IframeComponent>()

  @Output() onBeforeClose = new EventEmitter<IframeComponent>()

  @Output() onMessage = new EventEmitter<IframeMessageData>()

  @Output() onMouseEnter = new EventEmitter<IframeMouseData>()

  @Output() onMouseLeave = new EventEmitter<IframeMouseData>()

  @Output() onResized = new EventEmitter<IframeResizedData>()

  @Output() onScroll = new EventEmitter<{
    iframe: IframeComponent
    top: number
    left: number
  }>()

  get iframeResizer(): IframeObject | undefined {
    return this.resizer
  }

  @Input() options: IframeOptions & { logExpand?: boolean } = {
    license: '',
  }

  @Input() debug: boolean = false

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    const id = this.elementRef.nativeElement?.id

    this.consoleGroup.label(`angular(${id})`)
    this.consoleGroup.event('setup')
    this.consoleGroup.expand(this.options.logExpand)

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

      onMessage: (event: IframeMessageData) => this.onMessage.next(event),

      onMouseEnter: (event: IframeMouseData) => this.onMouseEnter.next(event),

      onMouseLeave: (event: IframeMouseData) => this.onMouseLeave.next(event),

      onReady: (iframe: IframeComponent) => this.onReady.next(iframe),

      onResized: (event: IframeResizedData) => this.onResized.next(event),

      onScroll: (event: {
        iframe: IframeComponent
        top: number
        left: number
      }) => this.onScroll.next(event),
    })(this.elementRef.nativeElement)
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

  public sendMessage(message: string, targetOrigin?: string): void {
    this.resizer?.sendMessage(message, targetOrigin)
  }
}

export {
  type IframeComponent,
  type IframeObject,
  type IframeOptions,
} from '@iframe-resizer/core'
