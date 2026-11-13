import { Component, input } from '@angular/core';

@Component({
  selector: 'of-brand-mark',
  template: '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false"><path d="M12 5H8a3 3 0 0 0-3 3v4m0 8v4a3 3 0 0 0 3 3h4m8 0h4a3 3 0 0 0 3-3v-4m0-8V8a3 3 0 0 0-3-3h-4" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M13 22V11h9m-9 5h7" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  host: {
    '[class.brand-tile]': 'tile()',
    '[class.brand-compact]': 'compact()',
  },
  styles: [':host{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;color:var(--of-text-strong)}svg{width:32px;height:32px}:host(.brand-tile){width:64px;height:64px;background:#fff;color:#000;border-radius:16px}:host(.brand-compact) svg{width:28px;height:28px}'],
})
export class BrandMark {
  readonly tile = input(false);
  readonly compact = input(false);
}
