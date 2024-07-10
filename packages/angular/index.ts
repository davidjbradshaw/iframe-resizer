import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import connectResizer from '@iframe-resizer/core';

// Please Note: iframe resizer lib in v5 doesn't export the type namespace properly, so we need to get the types like this:
type IFrameComponentType = ReturnType<typeof iframeResize>[number];

@Component({
  standalone: true,
  selector: "app-iframe",
  templateUrl: "./iframe.component.html",
  styleUrls: ["./iframe.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IFrameComponent implements AfterViewInit {
  @ViewChild("myiframe") element!: ElementRef<HTMLIFrameElement>;

  @Input()
  url: SafeResourceUrl = "";

  @Input()
  title!: string;

  @Output()
  loadChanged = new EventEmitter<void>();

  name: string;

  private component: IFrameComponentType | null = null;
  private resizer: IFrameObject | null = null;

  sanitizer: DomSanitizer;
  options: IFrameOptions;

  constructor(
    sanitizer: DomSanitizer,
    bodyBackground: string,
    bodyMargin: string,
    bodyPadding: string,
    checkOrigin: boolean,
    direction: string,
    inPageLinks: boolean,
    license: string,
    log: boolean,
    offset: number,
    scrolling: boolean,
    tolerance: number,
    waitForLoad: boolean,
    warningTimeout: number
  ) {
    this.sanitizer = sanitizer;
    this.options = {
      bodyBackground,
      bodyMargin,
      bodyPadding,
      checkOrigin,
      direction,
      inPageLinks,
      license,
      log,
      offset,
      scrolling,
      tolerance,
      waitForLoad,
      warningTimeout,
    };
    this.name = window.name;
  }

  ngAfterViewInit(): void {
    const { nativeElement } = this.element;

    this.resizer = connectResizer(this.options)(nativeElement);

    this.component = nativeElement || null;
  }

  ngOnDestroy(): void {
    if (this.component) {
      this.resizer?.disconnect();
    }
  }
}
