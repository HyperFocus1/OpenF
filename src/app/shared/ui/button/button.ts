import { booleanAttribute, Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

@Component({
  selector: 'button[ofButton]',
  imports: [Icon],
  template: `
    @if (icon() && iconPosition() === 'start' && !busy()) { <of-icon [name]="icon()!" /> }
    <ng-content />
    @if (icon() && iconPosition() === 'end' && !busy()) { <of-icon [name]="icon()!" /> }
  `,
  host: {
    class: 'of-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.aria-busy]': 'busy() || null',
    '[disabled]': 'disabled() || busy()',
    '[attr.aria-pressed]': 'toggle() ? active() : null',
    '[class.active]': 'active()',
  },
})
export class Button {
  readonly icon = input<IconName | null>(null);
  readonly iconPosition = input<'start' | 'end'>('start');
  readonly variant = input<ButtonVariant>('primary', { alias: 'ofButton' });
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly busy = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly active = input(false, { transform: booleanAttribute });
  readonly toggle = input(false, { transform: booleanAttribute });
}
