import { Component } from '@angular/core'
import { IframeResizerDirective } from '@iframe-resizer/angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IframeResizerDirective],
  template: `
    <h2>@iframe-resizer/angular example</h2>
    <iframe
      iframe-resizer
      [options]="{
        license: 'GPLv3',
        log: true,
        inPageLinks: true
      }"
      id="myIframe"
      src="child/frame.test.html"
      style="width: 100%; height: 100vh"
      (onMessage)="onMessage($event)"
      (onResized)="onResized($event)"
    ></iframe>
  `,
})
export class AppComponent {
  onResized(data: any) {
    console.log('resized', data)
  }

  onMessage(data: any) {
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
  }
}
