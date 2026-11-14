import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { KanbanStateService } from '@core/services/kanban/kanban-state.service';
import type { KanbanAction } from '@models/kanban/kanban-view.model';
import type { OptimisticMove } from './kanban-move.model';
import { pendingMove, projectMoves, resolveMove } from './kanban-moves';

/** Component-scoped UI state; data services retain responsibility for persistence. */
@Injectable()
export class KanbanUiStateService {
  private readonly state = inject(KanbanStateService);
  private readonly moves = signal<readonly OptimisticMove[]>([]);
  private readonly moveError = signal('');
  private activeMove: OptimisticMove | null = null;

  readonly tabs = this.state.tabs;
  readonly activeView = this.state.activeView;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly savingMoves = computed(() => this.moves().length > 0);
  readonly view = computed(() => {
    const source = this.state.view();
    if (!source) return null;
    const view = projectMoves(source, this.moves());
    return this.moveError() ? { ...view, error: this.moveError() } : view;
  });

  constructor() {
    effect(() => {
      const source = this.state.view();
      this.moves();
      if (!source || source.busy || this.state.loading()) return;

      // Presentation stays optimistic for every queued move. Persistence follows
      // the user's order so concurrent drops cannot overwrite each other's order.
      untracked(() => {
        if (this.activeMove) {
          if (source.error) this.moveError.set(`${this.activeMove.id}: ${source.error}`);
          const settled = this.activeMove;
          this.activeMove = null;
          this.moves.update((moves) => moves.filter((move) => move !== settled));
        }
        const next = this.moves()[0];
        if (!next) return;
        this.activeMove = next;
        this.state.moveTask(resolveMove(next, this.state.tasks()));
      });
    });
  }

  dispatch(action: KanbanAction): void {
    if (action.type !== 'taskMoved') {
      this.state.dispatch(action);
      return;
    }
    const view = this.view();
    const move = view && pendingMove(view, action.move);
    if (!move) return;
    this.moveError.set('');
    this.moves.update((moves) => [...moves, move]);
  }

  reload(): void {
    this.state.reload();
  }
}
