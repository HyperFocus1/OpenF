import { Component, input, model } from '@angular/core';
import { Tabs, TabOption } from '@shared/ui';

/** Persistent page frame, independent of the board request and its data. */
@Component({
  selector: 'of-kanban-layout',
  imports: [Tabs],
  template: `
    <div class="mx-auto min-w-0 max-w-[1720px] px-7 pt-8 pb-8 compact:px-2 compact:pt-4">
      <header class="flex flex-col items-start gap-2.5">
        <h1 class="text-[28px] leading-tight font-normal tracking-[-0.7px]">Tasks</h1>
        <of-tabs
          label="Vistas de tareas"
          panelId="kanban-panel"
          [options]="tabs()"
          [(value)]="activeView"
        />
      </header>
      <ng-content />
    </div>
  `,
  host: { class: 'block min-h-dvh min-w-0 bg-canvas text-content', 'data-theme': 'dark' },
})
export class KanbanLayout {
  readonly tabs = input.required<readonly TabOption[]>();
  readonly activeView = model.required<string>();
}
