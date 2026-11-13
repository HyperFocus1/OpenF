import { Component, input } from '@angular/core';

@Component({
  selector: 'of-action-group',
  template: '<ng-content />',
  host: { role: 'group', '[attr.aria-label]': 'label()', '[attr.data-gap]': 'gap()', '[attr.data-direction]': 'direction()' },
  styles: [':host{display:inline-flex;align-items:center;gap:4px}:host([data-gap="md"]){gap:8px}:host([data-direction="vertical"]){flex-direction:column}'],
})
export class ActionGroup {
  readonly label = input.required<string>();
  readonly gap = input<'sm' | 'md'>('sm');
  readonly direction = input<'horizontal' | 'vertical'>('horizontal');
}
