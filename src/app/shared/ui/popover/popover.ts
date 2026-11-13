import { Component, input, output } from '@angular/core';

@Component({
  selector: 'of-popover',
  template: '<div [id]="popoverId()" popover="auto" role="dialog" [attr.aria-label]="label()" (toggle)="onToggle($event)"><ng-content /></div>',
  styles: ['div{position:fixed;inset:auto auto 24px 24px;margin:0;width:240px;max-width:calc(100vw - 48px);padding:24px 16px 16px;border:1px solid rgb(255 255 255 / 12%);border-radius:32px;background:rgb(225 225 230 / 84%);color:#19191c;backdrop-filter:blur(28px);box-shadow:0 16px 64px rgb(0 0 0 / 35%)}div::backdrop{background:transparent}'],
})
export class Popover {
  readonly popoverId = input.required<string>();
  readonly label = input.required<string>();
  readonly toggled = output<boolean>();

  protected onToggle(event: Event): void {
    this.toggled.emit((event as ToggleEvent).newState === 'open');
  }
}
