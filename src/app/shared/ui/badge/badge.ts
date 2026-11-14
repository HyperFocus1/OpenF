import { booleanAttribute, Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

export type BadgeTone = 'neutral' | 'primary' | 'danger';

/** Compact, non-interactive metadata. Always pair color with a text label. */
@Component({
  selector: 'of-badge',
  imports: [Icon],
  template: `
    @if (dot()) {
      <span class="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true"></span>
    }
    @if (icon()) {
      <of-icon [name]="icon()!" />
    }
    <ng-content />
  `,
  host: {
    '[attr.data-tone]': 'tone()',
    class:
      'inline-flex max-w-full items-center gap-1.5 rounded-full border border-outline-subtle bg-surface px-2 py-0.5 text-[11px] leading-4.5 whitespace-nowrap text-content-muted [--of-icon-size:13px] data-[tone=primary]:border-transparent data-[tone=primary]:bg-selected data-[tone=primary]:text-on-selected data-[tone=danger]:border-transparent data-[tone=danger]:bg-[var(--of-error-background)] data-[tone=danger]:text-danger',
  },
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
  readonly icon = input<IconName | null>(null);
  readonly dot = input(false, { transform: booleanAttribute });
}
