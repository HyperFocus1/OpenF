import { Component, computed, input, model } from '@angular/core';
import { Tabs, TabOption } from '@shared/ui';

@Component({
  selector: 'book-tabs-preview',
  imports: [Tabs],
  template: `<div class="max-w-full">
    <of-tabs
      [label]="label()"
      [variant]="variant()"
      panelId="example-panel"
      [options]="options()"
      [(value)]="value"
    />
    <div
      id="example-panel"
      role="tabpanel"
      [attr.aria-labelledby]="'example-panel-tab-' + value()"
      tabindex="0"
      class="mt-5 rounded-control border border-outline-subtle p-5 text-sm"
    >
      Vista actual: {{ selectedLabel() }}
    </div>
  </div>`,
})
export class TabsPreview {
  readonly label = input.required<string>();
  readonly options = input.required<readonly TabOption[]>();
  readonly value = model('board');
  readonly variant = input<'segmented' | 'underline'>('segmented');
  protected readonly selectedLabel = computed(
    () => this.options().find((option) => option.id === this.value())?.label ?? '',
  );
}
