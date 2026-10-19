/**
 * Angular directive for iframe-resizer by Bjørn Håkon (https://github.com/bjornoss)
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  Output,
  PLATFORM_ID,
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
  IFrameScrollData,
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

  private viewReady = false

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

  // Declared so a changed id reaches the iframe and re-binds, letting core
  // report that a bound iframe cannot change its id
  @Input() id?: string

  @Input() debug: boolean = false

  constructor(
    private elementRef: ElementRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: string,
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
    const given = options as IFrameOptions

    // A callback given in [options] runs too, in the same zone entry as the
    // Output, so neither is lost and a template updates either way
    const both =
      <T>(output: EventEmitter<T>, callback?: (event: T) => unknown) =>
      (event: T): void => {
        if (!callback && !hasSubscribers(output)) return
        this.zone.run(() => {
          callback?.(event)
          output.next(event)
        })
      }

    // Mouse events add listeners in the child and a message per pointer
    // crossing, so they are only on when a mouse Output is bound, or given in
    // [options], as this connects; a later subscription waits for a change
    const mouseEvents =
      hasSubscribers(this.onMouseEnter) ||
      hasSubscribers(this.onMouseLeave) ||
      given.onMouseEnter ||
      given.onMouseLeave
        ? {
            onMouseEnter: both(this.onMouseEnter, given.onMouseEnter),
            onMouseLeave: both(this.onMouseLeave, given.onMouseLeave),
          }
        : {}

    return {
      ...options,

      // Angular owns the iframe, so the close is always cancelled. A bound
      // Output can remove it, once core has finished with the close
      onBeforeClose: () => {
        this.consoleGroup.event('close')
        if (hasSubscribers(this.onBeforeClose)) {
          queueMicrotask(() =>
            this.emit(this.onBeforeClose, this.elementRef.nativeElement),
          )
        } else {
          this.consoleGroup.warn(
            'Close event ignored, to remove the iframe update your Angular component.',
          )
        }
        return false
      },

      onMessage: both(this.onMessage, given.onMessage),

      ...mouseEvents,

      onReady: both(this.onReady, given.onReady),

      onResized: both(this.onResized, given.onResized),

      // Emits once core has scrolled, as change detection before that could
      // move the page under the position core has already worked out. One
      // given in [options] runs at once, as returning false cancels the scroll
      onScroll: (event: IFrameScrollData) => {
        queueMicrotask(() => this.emit(this.onScroll, event))
        return given.onScroll?.(event)
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
    // Angular also runs this when rendering on the server, where there is no
    // window; this is the test isPlatformBrowser() makes, without @angular/common
    if (this.platformId !== 'browser') return

    const id = this.elementRef.nativeElement?.id

    // auto-console-group queues microtasks, which inside the zone would cost
    // a change detection pass each time a directive is created
    this.zone.runOutsideAngular(() => {
      this.consoleGroup.label(`angular(${id})`)
      this.consoleGroup.event('setup')
      this.consoleGroup.expand(
        this.options.log === EXPAND || this.options.log === LOG_EXPANDED,
      )
      if (this.debug) this.consoleGroup.log('ngAfterViewInit')
    })

    this.viewReady = true
    this.resizer = this.connect()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // An id input shadows the DOM binding, so pass it on to the iframe
    if (changes.id && this.id !== undefined)
      this.elementRef.nativeElement.id = this.id

    // Re-bind when @Input options change. Skip the first call: the view isn't
    // ready, and ngAfterViewInit connects. Not tested on this.resizer, as a
    // first connect that fails, such as on an invalid option, leaves it unset
    if (!this.viewReady || !(changes.options || changes.id)) return
    if (this.debug) this.consoleGroup.log('ngOnChanges: options updated')
    this.resizer = this.connect() ?? this.resizer
  }

  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      if (this.debug) this.consoleGroup.log('ngOnDestroy')
      this.consoleGroup.endAutoGroup()
      this.resizer?.disconnect()
    })
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
