// The main page's app without zone.js, so the e2e tests can check that a
// bound Output still updates its template in a zoneless app
import { provideExperimentalZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app.component'

bootstrapApplication(AppComponent, {
  providers: [provideExperimentalZonelessChangeDetection()],
})
