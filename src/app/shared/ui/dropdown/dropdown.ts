import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, input, signal } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

/** Anchored CDK overlay for compact forms and actions. Closes outside or with Escape. */
@Component({
  selector: 'of-dropdown',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, CdkTrapFocus, Icon],
  template: `
    <button
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      type="button"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? panelId() : null"
      aria-haspopup="dialog"
      class="flex items-center justify-center gap-2 text-[11px] text-content hover:bg-surface-hover [--of-icon-size:14px]"
      [class]="
        iconOnly()
          ? 'size-7 rounded-md border-0 bg-transparent p-1'
          : 'min-h-9 rounded-lg border border-outline-subtle bg-surface px-3 py-1.5'
      "
      (click)="open.update((value) => !value)"
    >
      <of-icon [name]="icon()" /><span [class.of-sr-only]="iconOnly()">{{ label() }}</span>
      @if (count()) {
        <span
          class="flex size-4.5 items-center justify-center rounded-full bg-selected text-[10px] text-on-selected"
          >{{ count() }}</span
        >
      }
    </button>
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="open.set(false)"
      (overlayKeydown)="keydown($event)"
    >
      <div
        [attr.data-theme]="scheme() === 'inherit' ? null : scheme()"
        [id]="panelId()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="label()"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        class="w-60 max-w-[calc(100vw-32px)] rounded-control border border-outline-subtle bg-surface p-5 text-content shadow-[var(--of-popover-shadow)]"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
})
export class Dropdown {
  readonly label = input.required<string>();
  readonly panelId = input.required<string>();
  readonly icon = input<IconName>('sliders');
  readonly count = input(0);
  readonly iconOnly = input(false);
  readonly scheme = input<'inherit' | 'light' | 'dark'>('inherit');
  protected readonly open = signal(false);
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];
  protected keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      this.open.set(false);
    }
  }
}
