import { Component, input } from '@angular/core';
import { OPENF_MARK_PATH } from './brand-mark.paths';

@Component({
  selector: 'of-brand-mark',
  template: `<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><path [attr.d]="path" fill-rule="evenodd" /></svg>`,
  host: {
    '[class.brand-tile]': 'tile()',
    '[class.brand-compact]': 'compact()',
  },
  styles: [
    ':host{display:inline-flex;flex:none;align-items:center;justify-content:center;width:40px;height:40px;color:var(--of-primary)}svg{width:40px;height:40px}:host(.brand-tile){width:64px;height:64px;background:var(--of-primary);color:var(--of-on-primary);border-radius:20px}:host(.brand-compact){width:32px;height:32px}:host(.brand-compact) svg{width:28px;height:28px}',
  ],
})
export class BrandMark {
  protected readonly path = OPENF_MARK_PATH;
  readonly tile = input(false);
  readonly compact = input(false);
}
