import { Provider } from '@angular/core';
import { KanbanMockServiceImpl } from '@core/services/kanban/kanban-mock-impl.service';
import { KanbanStateService } from '@core/services/kanban/kanban-state.service';
import { KANBAN_SERVICE_TOKEN } from './tokens';

/** Feature-scoped demo: the tasks domain always uses local mocks, including API builds. */
export function provideKanban(): Provider[] {
  return [{ provide: KANBAN_SERVICE_TOKEN, useClass: KanbanMockServiceImpl }, KanbanStateService];
}
