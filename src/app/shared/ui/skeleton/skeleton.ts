import { Component, input } from '@angular/core';

/** Decorative placeholder; the caller supplies dimensions and any group animation. */
@Component({
  selector: 'of-skeleton',
  template: '',
  host: {
    class: 'block shrink-0 bg-surface-active',
    'aria-hidden': 'true',
    '[class.rounded-full]': 'shape() === "circle"',
    '[class.rounded]': 'shape() === "rectangle"',
  },
})
export class Skeleton {
  readonly shape = input<'rectangle' | 'circle'>('rectangle');
}
