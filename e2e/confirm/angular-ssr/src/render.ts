// Server-side render of a component using the iframe-resizer Angular directive.
// Prints one line "RESULT <json>" with the errors Angular's ErrorHandler saw and the HTML.
import 'reflect-metadata'
import 'zone.js/node'
import '@angular/compiler'
import { Component, ErrorHandler } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { IframeResizerDirective } from './directive.js'

const errors: string[] = []

class CollectingErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    errors.push(String((error as Error)?.stack ?? error))
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IframeResizerDirective],
  template: `<iframe id="frame" iframe-resizer [options]="{ license: 'GPLv3' }" src="about:blank"></iframe>`,
})
class AppComponent {}

const indexHtml =
  '<!doctype html><html><head></head><body><app-root></app-root></body></html>'

let html = ''
let renderError: string | undefined

try {
  html = await renderApplication(
    (context) =>
      bootstrapApplication(
        AppComponent,
        { providers: [{ provide: ErrorHandler, useClass: CollectingErrorHandler }] },
        context,
      ),
    { document: indexHtml },
  )
} catch (error) {
  renderError = String((error as Error)?.stack ?? error)
}

console.log(`RESULT ${JSON.stringify({ errors, renderError, html })}`)
