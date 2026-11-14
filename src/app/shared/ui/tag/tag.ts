import { Component, input } from '@angular/core';

/** Compact catalog label. The source supplies its optional color and marker. */
@Component({
  selector: 'of-tag',
  template: `@if (emoji()) {
      <span aria-hidden="true">{{ emoji() }}</span>
    }
    <ng-content />`,
  host: {
    class:
      'inline-flex max-w-full items-center gap-1 rounded-[3px] bg-surface-active px-1.5 py-1 text-[10px] leading-none font-medium whitespace-nowrap text-content',
    '[style.background-color]': 'color()',
    '[style.color]': 'color() ? "#fff" : null',
  },
})
export class Tag {
  readonly color = input<string>();
  readonly emoji = input<string>();
}
