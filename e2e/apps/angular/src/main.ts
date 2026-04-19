import 'zone.js'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AppComponent } from './app.component'

@NgModule({
  declarations: [],
  imports: [BrowserModule, AppComponent],
  bootstrap: [AppComponent],
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule)
