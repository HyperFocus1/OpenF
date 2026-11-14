import { Component, input, model } from '@angular/core';
import { Icon, IconName } from '../icon/icon';
import { Ripple } from '../ripple/ripple.directive';

export interface TabOption {
  id: string;
  label: string;
  icon?: IconName;
  count?: number;
}

/** A single panel follows the selected tab. Arrow keys, Home and End select and focus. */
@Component({
  selector: 'of-tabs',
  imports: [Icon, Ripple],
  template: `
    <div
      class="flex max-w-full gap-1 overflow-x-auto"
      [class]="
        variant() === 'underline'
          ? 'w-full border-b border-outline-subtle'
          : 'rounded-control border border-outline-subtle bg-surface-lowest p-1'
      "
      role="tablist"
      [attr.aria-label]="label()"
      (keydown)="onKeydown($event)"
    >
      @for (option of options(); track option.id) {
        <button
          ofRipple
          class="inline-flex min-h-9 items-center justify-center gap-1.5 bg-transparent font-medium whitespace-nowrap text-content-muted aria-selected:text-content focus-visible:outline-offset-[-2px] [--of-icon-size:16px]"
          [class]="
            variant() === 'underline'
              ? 'border-0 border-b-2 border-transparent px-2 py-2.5 text-[11px] aria-selected:border-primary'
              : 'rounded-lg border border-transparent px-3.5 py-1.5 text-xs leading-5 aria-selected:border-outline-subtle aria-selected:bg-surface aria-selected:shadow-xs aria-selected:[&_of-icon]:text-primary compact:px-2.5'
          "
          type="button"
          role="tab"
          [id]="panelId() + '-tab-' + option.id"
          [attr.aria-controls]="panelId()"
          [attr.aria-selected]="value() === option.id"
          [tabIndex]="value() === option.id ? 0 : -1"
          (click)="value.set(option.id)"
        >
          @if (option.icon) {
            <of-icon [name]="option.icon" />
          }
          {{ option.label }}
          @if (option.count !== undefined) {
            <span
              class="flex h-4 min-w-4 items-center justify-center rounded px-1 text-[9px]"
              [class]="value() === option.id ? 'bg-primary text-on-primary' : 'text-content-muted'"
              >{{ option.count }}</span
            >
          }
        </button>
      }
    </div>
  `,
  host: { class: 'inline-flex max-w-full min-w-0' },
})
export class Tabs {
  readonly options = input.required<readonly TabOption[]>();
  readonly variant = input<'segmented' | 'underline'>('segmented');
  readonly label = input.required<string>();
  readonly panelId = input.required<string>();
  readonly value = model.required<string>();

  protected onKeydown(event: KeyboardEvent): void {
    const options = this.options();
    if (!options.length || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.id === this.value());
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? options.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    this.value.set(options[next].id);
    (event.currentTarget as HTMLElement)
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  }
}
