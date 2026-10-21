import 'zone.js'
import { AfterViewInit, Component } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import type { IFrameOptions } from '@iframe-resizer/core'
import { IframeResizerDirective } from '@iframe-resizer/angular'

// Changes two options before the child is ready, in ngAfterViewInit, which
// runs after the directive has bound the iframe. The child page holds its
// script back until told to go, so the change always comes before init.
// ?late makes the same change after onReady instead, as a control.
const EARLY: Partial<IFrameOptions> = {
  direction: 'horizontal-inline',
  bodyBackground: 'rgb(0, 128, 0)',
}
const LATE = location.search.includes('late')

@Component({
  selector: 'app-early-update',
  standalone: true,
  imports: [IframeResizerDirective],
  template: `
    <p>
      Direction: <span id="direction">{{ direction }}</span>
      Ready: <span id="status">{{ status }}</span>
    </p>
    <iframe
      iframe-resizer
      [options]="options"
      id="frame"
      src="child/frame.early-update.html"
      style="width: 600px; height: 100px"
      (onReady)="onReady()"
    ></iframe>
  `,
})
export class EarlyUpdateComponent implements AfterViewInit {
  options: IFrameOptions = { license: 'GPLv3', log: true }

  direction = 'vertical'

  status = 'pending'

  constructor() {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.data !== 'early-update:loaded') return
      const frame = document.getElementById('frame') as HTMLIFrameElement
      frame.contentWindow?.postMessage('early-update:go', '*')
    })
  }

  ngAfterViewInit(): void {
    if (!LATE) this.apply()
  }

  onReady(): void {
    if (LATE) this.apply()
    this.status = 'ready'
  }

  private apply(): void {
    this.options = { ...this.options, ...EARLY }
    this.direction = EARLY.direction as string
  }
}

bootstrapApplication(EarlyUpdateComponent)
