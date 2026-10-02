import { Component } from '@angular/core'
import type { IFrameOptions } from '@iframe-resizer/core'
import { IframeResizerDirective } from './iframe-resizer.directive'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IframeResizerDirective],
  template: `
    <h2>iframe-resizer/angular example</h2>
    @for (step of steps; track step) {
      <button id="update-{{ step }}" (click)="update(step)">Update {{ step }}</button>
    }
    <iframe
      iframe-resizer
      [options]="options"
      id="myIframe"
      src="child/frame.test.html"
      style="width: 100%; height: 100vh"
      (onMessage)="onMessage($event)"
      (onResized)="onResized($event)"
    ></iframe>
  `,
})
export class AppComponent {
  options: IFrameOptions = {
    license: 'GPLv3',
    log: true,
    inPageLinks: true,
  }

  // Option changes applied after init by the e2e tests, one button per step
  updates: Record<string, Partial<IFrameOptions>> = {
    styles: {
      bodyBackground: 'rgb(0, 128, 0)',
      bodyPadding: '6px',
      bodyMargin: 12,
      scrolling: true,
      checkOrigin: [location.origin],
    },
    offset: { bodyBackground: 'rgb(0, 0, 128)', offsetSize: 100 },
    tolerance: { bodyBackground: 'rgb(128, 0, 0)', tolerance: 1000 },
    links: { bodyBackground: 'rgb(128, 128, 0)', inPageLinks: false },
    direction: { bodyBackground: 'rgb(0, 128, 128)', direction: 'horizontal' },
  }

  steps = Object.keys(this.updates)

  // Reassign rather than mutate so ngOnChanges sees a new options input
  update(step: string) {
    this.options = { ...this.options, ...this.updates[step] }
  }

  onResized(data: any) {
    console.log('resized', data)
  }

  onMessage(data: any) {
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }
}
