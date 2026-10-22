import { Component, inject, signal } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { IframeResizerDirective } from '@iframe-resizer/angular'
import type {
  IFrameMessageData,
  IFrameOptions,
  IFrameResizedData,
} from '@iframe-resizer/angular'

// Each page sets <body data-example>, see index.html, two.html and width-*.html
const example = document.body.dataset['example'] ?? 'index'

const DIRECTIONS: Record<string, IFrameOptions['direction']> = {
  'width-inline': 'horizontal-inline',
  'width-block': 'horizontal-block',
}

const TITLES: Record<string, string> = {
  index: 'one iframe',
  two: 'two iframes',
  'width-inline': 'width (inline)',
  'width-block': 'width (block)',
}

// Leaves the iframe element out of the event data shown on the page
const withoutIframe = (key: string, value: unknown): unknown =>
  key === 'iframe' ? undefined : value

@Component({
  selector: 'app-root',
  imports: [IframeResizerDirective],
  template: `
    <h2>&#64;iframe-resizer/angular example: {{ title }}</h2>
    <nav id="anchorParentTest">
      <a href="index.html">One iframe</a>
      <a href="two.html">Two iframes</a>
      <a href="width-inline.html">Width (inline)</a>
      <a href="width-block.html">Width (block)</a>
    </nav>

    <div class="frames" [class.width]="direction">
      @for (id of ids; track id) {
        <iframe
          iframe-resizer
          [id]="id"
          [src]="src"
          [options]="options"
          (onMessage)="onMessage($event)"
          (onResized)="onResized($event)"
        ></iframe>
      }
    </div>

    @if (eventData(); as data) {
      <div class="message-data">
        <h3>Event Data:</h3>
        <pre>{{ data }}</pre>
      </div>
    }
  `,
  styles: `
    nav {
      margin-bottom: 16px;
    }

    nav a {
      margin-right: 16px;
    }

    .frames {
      display: flex;
      gap: 2%;
      align-items: flex-start;
      margin-top: 16px;
    }

    .frames iframe {
      flex: 1;
      min-width: 0;
      height: 100vh;
    }

    /* The width examples size the iframe to its content */
    .frames.width iframe {
      flex: none;
      height: 300px;
    }

    .message-data {
      margin-top: 20px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .message-data h3 {
      margin: 0 0 8px;
    }

    .message-data pre {
      margin: 0;
      overflow: auto;
    }
  `,
})
export class AppComponent {
  readonly title = TITLES[example]

  readonly direction = DIRECTIONS[example]

  readonly ids = example === 'two' ? ['myIframe1', 'myIframe2'] : ['myIframe']

  // The child page is ours, so Angular is told it may load it
  readonly src = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    this.direction
      ? `child/frame.width.html?direction=${this.direction}`
      : 'child/frame.content.html',
  )

  readonly options: IFrameOptions = {
    license: 'GPLv3',
    direction: this.direction,
    inPageLinks: true,
    log: 'collapsed',
  }

  readonly eventData = signal<string | null>(null)

  onResized(data: IFrameResizedData): void {
    this.eventData.set(JSON.stringify(data, withoutIframe, 2))
  }

  onMessage(data: IFrameMessageData): void {
    this.eventData.set(JSON.stringify(data, withoutIframe, 2))
    alert(`Message from frame ${data.iframe.id}: ${data.message}`)
    data.iframe.iframeResizer.sendMessage('Hello back from the parent page')
  }
}
