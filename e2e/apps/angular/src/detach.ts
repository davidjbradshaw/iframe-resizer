// Detaches the view holding the iframe and inserts it again later, as a route
// reuse strategy does: the directive stays alive while its iframe is out of
// the page, so the page in the iframe reloads when it comes back
import 'zone.js'
import {
  AfterViewInit,
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  type ViewRef,
} from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import type { IFrameOptions } from '@iframe-resizer/core'
import { IframeResizerDirective } from '@iframe-resizer/angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IframeResizerDirective],
  template: `
    <button id="hide" (click)="hide()">Hide</button>
    <button id="show" (click)="show()">Show</button>
    <button id="recolour" (click)="recolour()">Recolour</button>
    <ng-template #frame>
      <iframe
        iframe-resizer
        [options]="options"
        id="kept"
        src="child/frame.content.html"
        style="width: 100%"
        (onReady)="onReady()"
      ></iframe>
    </ng-template>
    <ng-container #outlet></ng-container>
  `,
})
class DetachComponent implements AfterViewInit {
  @ViewChild('frame') frame!: TemplateRef<unknown>

  @ViewChild('outlet', { read: ViewContainerRef }) outlet!: ViewContainerRef

  private view?: ViewRef

  options: IFrameOptions = {
    license: 'GPLv3',
    bodyBackground: 'rgb(255, 255, 255)',
  }

  ngAfterViewInit() {
    this.view = this.outlet.createEmbeddedView(this.frame)
  }

  hide() {
    this.outlet.detach()
  }

  show() {
    if (this.view) this.outlet.insert(this.view)
  }

  recolour() {
    this.options = { ...this.options, bodyBackground: 'rgb(0, 128, 0)' }
  }

  onReady() {
    ;(window as any).readyCount = ((window as any).readyCount ?? 0) + 1
  }
}

bootstrapApplication(DetachComponent)
