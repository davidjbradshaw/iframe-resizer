import { Component } from '@angular/core'
import type { IFrameOptions } from '@iframe-resizer/core'
import { IframeResizerDirective } from './iframe-resizer.directive'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IframeResizerDirective],
  template: `
    <h2>iframe-resizer/angular example</h2>
    <button id="update-option" (click)="updateOption()">Update option</button>
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

  // Reassign rather than mutate so ngOnChanges sees a new options input
  updateOption() {
    this.options = {
      ...this.options,
      bodyBackground: 'rgb(0, 128, 0)',
      bodyPadding: '6px',
      bodyMargin: 12,
      scrolling: true,
    }
  }

  onResized(data: any) {
    console.log('resized', data)
  }

  onMessage(data: any) {
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }
}
