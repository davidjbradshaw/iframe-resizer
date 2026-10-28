import { Component } from '@angular/core'
import type { IFrameOptions } from '@iframe-resizer/core'
import { IframeResizerDirective } from '@iframe-resizer/angular'
import { record, updates as optionSteps } from '../../../shared/app'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IframeResizerDirective],
  template: `
    <h2>iframe-resizer/angular example</h2>
    @for (step of steps; track step) {
      <button id="update-{{ step }}" (click)="update(step)">Update {{ step }}</button>
    }
    <p>Resized height: <span id="resized-height">{{ resizedHeight }}</span></p>
    <iframe
      iframe-resizer
      [options]="options"
      id="myIframe"
      src="child/frame.test.html"
      style="width: 100%; height: 100vh"
      (onMessage)="onMessage($event)"
      (onReady)="onReady()"
      (onResized)="onResized($event)"
      (onScroll)="onScroll()"
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
  updates: Record<string, Partial<IFrameOptions>> = optionSteps(location.origin)

  steps = Object.keys(this.updates)

  // Reassign rather than mutate so ngOnChanges sees a new options input
  update(step: string) {
    this.options = { ...this.options, ...this.updates[step] }
  }

  // Set by the bound onResized Output, so the e2e tests can see the template update
  resizedHeight = ''

  onReady() {
    record('onReady')
  }

  onResized(data: any) {
    record('onResized', { type: data.type })
    this.resizedHeight = `${data.height}px`
  }

  onMessage(data: any) {
    record('onMessage', { message: data.message })
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }

  onScroll() {
    record('onScroll')
  }
}
