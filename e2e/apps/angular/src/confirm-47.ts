import 'zone.js'
import { ApplicationRef, Component, type DoCheck } from '@angular/core'
import {
  bootstrapApplication,
  DomSanitizer,
  type SafeResourceUrl,
} from '@angular/platform-browser'
import { filter, firstValueFrom } from 'rxjs'
import type { IFrameOptions } from '@iframe-resizer/core'
import { IframeResizerDirective } from './iframe-resizer.directive'

// Finding 47: counts application change-detection passes while the child
// sends resize messages. No directive Output is bound, so a message should
// not need to run change detection at all.
@Component({
  selector: 'app-confirm-47',
  standalone: true,
  imports: [IframeResizerDirective],
  template: `
    <h2>Angular zone confirm 47</h2>
    <iframe
      iframe-resizer
      [options]="options"
      id="myIframe"
      [src]="childSrc"
      style="width: 100%; height: 100px"
    ></iframe>
  `,
})
export class Confirm47Component implements DoCheck {
  options: IFrameOptions = { license: 'GPLv3' }

  childSrc: SafeResourceUrl

  constructor(sanitizer: DomSanitizer, appRef: ApplicationRef) {
    // Resolves once NgZone has no pending macrotasks
    ;(window as any).whenStable = () =>
      firstValueFrom(appRef.isStable.pipe(filter(Boolean)))
    // ?child=<origin> selects a same- or cross-origin child page
    const origin =
      new URLSearchParams(location.search).get('child') ?? location.origin
    this.childSrc = sanitizer.bypassSecurityTrustResourceUrl(
      `${origin}/e2e/fixtures/confirm/47-angular-zone-child.html`,
    )
    ;(window as any).cdCount = 0
  }

  ngDoCheck(): void {
    ;(window as any).cdCount += 1
  }
}

bootstrapApplication(Confirm47Component)
