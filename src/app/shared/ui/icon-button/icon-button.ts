import { booleanAttribute, Component, input, output, signal } from '@angular/core';
import { Icon, IconName } from '../icon/icon';
import { Ripple } from '../ripple/ripple.directive';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost';

@Component({
  selector: 'of-icon-button',
  imports: [Icon, Ripple],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.css',
  host: { '(document:keydown.escape)': 'tooltipDismissed.set(true)', '[attr.data-kind]': 'kind()', '[attr.data-size]': 'size()', '[attr.data-shape]': 'shape()', '[attr.data-variant]': 'variant()' },
})
export class IconButton {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly kind = input<'action' | 'navigation'>('action');
  readonly variant = input<IconButtonVariant>('ghost');
  readonly shape = input<'rounded' | 'circle'>('rounded');
  readonly size = input<'sm' | 'md' | 'lg'>('sm');
  readonly type = input<'button' | 'submit'>('button');
  readonly active = input(false, { transform: booleanAttribute });
  readonly toggle = input(false, { transform: booleanAttribute });
  readonly current = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly unavailable = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });
  readonly tooltip = input('');
  readonly tooltipPlacement = input<'right' | 'top'>('right');
  readonly popoverTarget = input<string>();
  readonly expanded = input<boolean>();
  readonly pressed = output<MouseEvent>();
  protected readonly tooltipDismissed = signal(false);

  protected activate(event: MouseEvent): void {
    if (this.unavailable() || this.disabled() || this.busy()) { event.preventDefault(); return; }
    this.pressed.emit(event);
  }
}
