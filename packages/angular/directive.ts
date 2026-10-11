/**
 * Angular directive for iframe-resizer by Bjørn Håkon (https://github.com/bjornoss)
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
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
import core from '@iframe-resizer/core'
import acg from 'auto-console-group'

// Deal with UMD not converting default exports to named exports
const createAutoConsoleGroup = esModuleInterop(acg)
// A test runner such as Vitest leaves this file to Node, which loads core's
// CommonJS build and so nests its default export
const connectResizer = esModuleInterop<typeof core>(core)

// RxJS 7 has Subject.observed; Angular 16 also allows RxJS 6, which has only
// the observers array
const hasSubscribers = <T>(output: EventEmitter<T>): boolean =>
  output.observed ?? output.observers.length > 0

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

  constructor(
    private elementRef: ElementRef,
    private zone: NgZone,
  ) {}

  // Emits inside the zone, so a bound handler updates its template. An
  // unbound Output is skipped, so library traffic costs no change detection.
  private emit<T>(output: EventEmitter<T>, event: T): void {
    if (!hasSubscribers(output)) return
    this.zone.run(() => output.next(event))
  }

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

      onMessage: (event: IFrameMessageData) => this.emit(this.onMessage, event),

      onMouseEnter: (event: IFrameMouseData) =>
        this.emit(this.onMouseEnter, event),

      onMouseLeave: (event: IFrameMouseData) =>
        this.emit(this.onMouseLeave, event),

      onReady: (iframe: IFrameComponent) => this.emit(this.onReady, iframe),

      onResized: (event: IFrameResizedData) => this.emit(this.onResized, event),

      // Emits once core has scrolled, as change detection before that could
      // move the page under the position core has already worked out
      onScroll: (event: {
        iframe: IFrameComponent
        top: number
        left: number
      }) => {
        queueMicrotask(() => this.emit(this.onScroll, event))
      },
    } as IFrameOptions
  }

  // Core runs outside the zone, so its message listener and timers do not
  // start change detection; a bound Output re-enters the zone in emit()
  private connect(): IFrameObject | undefined {
    return this.zone.runOutsideAngular(() =>
      connectResizer(this.buildOptions())(this.elementRef.nativeElement),
    )
  }

  ngAfterViewInit(): void {
    const id = this.elementRef.nativeElement?.id

    this.consoleGroup.label(`angular(${id})`)
    this.consoleGroup.event('setup')
    this.consoleGroup.expand(
      this.options.log === EXPAND || this.options.log === LOG_EXPANDED,
    )

    if (this.debug) this.consoleGroup.log('ngAfterViewInit')

    this.resizer = this.connect()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-bind when @Input options change. Skip the first call: the binding
    // hasn't been established yet at that point — ngAfterViewInit handles it.
    if (!this.resizer) return
    if (!changes.options) return
    if (this.debug) this.consoleGroup.log('ngOnChanges: options updated')
    this.connect()
  }

  ngOnDestroy(): void {
    if (this.debug) this.consoleGroup.log('ngOnDestroy')
    this.consoleGroup.endAutoGroup()
    this.resizer?.disconnect()
  }

  // parent methods, outside the zone as a same-origin child replies on a timer
  public moveToAnchor(anchor: string): void {
    this.zone.runOutsideAngular(() => this.resizer?.moveToAnchor(anchor))
  }

  public sendMessage(message: any, targetOrigin?: string): void {
    this.zone.runOutsideAngular(() =>
      this.resizer?.sendMessage(message, targetOrigin),
    )
  }
}

export type * from '@iframe-resizer/core'
