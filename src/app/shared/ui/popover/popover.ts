import { Component, input, output } from '@angular/core';

@Component({
  selector: 'of-popover',
  template: '<div [id]="popoverId()" popover="auto" role="dialog" [attr.aria-label]="label()" (toggle)="onToggle($event)"><ng-content /></div>',
  styles: ['div{position:fixed;inset:auto auto 24px 24px;margin:0;width:240px;max-width:calc(100vw - 48px);padding:24px 16px 16px;border:1px solid var(--of-outline);border-radius:32px;background:color-mix(in srgb,var(--of-surface-elevated) 96%,transparent);color:var(--of-text-strong);backdrop-filter:blur(28px);box-shadow:var(--of-popover-shadow)}div::backdrop{background:transparent}'],
})
export class Popover {
  readonly popoverId = input.required<string>();
  readonly label = input.required<string>();
  readonly toggled = output<boolean>();

  protected onToggle(event: Event): void {
    this.toggled.emit((event as ToggleEvent).newState === 'open');
  }
}
