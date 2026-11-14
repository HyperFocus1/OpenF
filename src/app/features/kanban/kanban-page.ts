import { Component, inject } from '@angular/core';
import { provideKanban } from '@configs/kanban.providers';
import { KanbanStateService } from '@core/services/kanban/kanban-state.service';
import { Kanban } from './kanban';
import { Alert, Button } from '@shared/ui';
import { KanbanLayout } from './components/kanban-layout/kanban-layout';
import { KanbanLoading } from './components/kanban-loading/kanban-loading';

/** Route boundary: connects DI with the input/output view, without mapping source data. */
@Component({
  selector: 'of-kanban-page',
  imports: [Alert, Button, Kanban, KanbanLayout, KanbanLoading],
  providers: [provideKanban()],
  template: `
    <of-kanban-layout
      [tabs]="state.tabs"
      [activeView]="state.activeView()"
      (activeViewChange)="state.dispatch({ type: 'viewChanged', value: $event })"
    >
      @if (state.view(); as view) {
        <of-kanban [view]="view" (action)="state.dispatch($event)" />
      } @else if (state.error()) {
        <div
          id="kanban-panel"
          role="tabpanel"
          [attr.aria-labelledby]="'kanban-panel-tab-' + state.activeView()"
          tabindex="0"
        >
          <of-alert class="mt-6">{{ state.error() }}</of-alert>
          <button ofButton="secondary" class="mt-4" (click)="state.reload()">
            Reintentar carga
          </button>
        </div>
      } @else if (state.activeView() === 'board') {
        <of-kanban-loading />
      } @else {
        <div
          id="kanban-panel"
          role="tabpanel"
          [attr.aria-labelledby]="'kanban-panel-tab-' + state.activeView()"
          tabindex="0"
          class="mt-7 min-h-96"
        ></div>
      }
    </of-kanban-layout>
  `,
  host: { class: 'block min-w-0', '[attr.aria-busy]': 'state.loading() || null' },
})
export class KanbanPage {
  protected readonly state = inject(KanbanStateService);
}
