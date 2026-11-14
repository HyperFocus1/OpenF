import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, finalize, map, Observable, Subscription, switchMap } from 'rxjs';
import { KANBAN_SERVICE_TOKEN } from '@configs/tokens';
import { LocalFileService } from '@core/services/files/local-file.service';
import {
  ColumnId,
  KanbanSnapshot,
  TaskChanges,
  TaskDraft,
  TaskMove,
  TaskPriority,
} from '@models/kanban/kanban.model';
import {
  KanbanAction,
  KanbanTaskView,
  KanbanViewModel,
  TaskDrop,
} from '@models/kanban/kanban-view.model';
import { columnViews, KANBAN_TABS, optionView, taskView } from './kanban-view.mapper';
import { KanbanScreenState } from './kanban-screen-state';

/** Receives source data, prepares the complete screen and handles user intentions. */
@Injectable()
export class KanbanStateService {
  private readonly source = inject(KANBAN_SERVICE_TOKEN);
  private readonly files = inject(LocalFileService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snapshot = signal<KanbanSnapshot | null>(null);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal('');
  private loadSubscription: Subscription | undefined;
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  private readonly query = signal('');
  private readonly priority = signal<TaskPriority | 'all'>('all');
  private readonly assignee = signal('all');
  private readonly order = signal<'manual' | 'priority'>('manual');
  private readonly screen = signal<KanbanScreenState>({
    commentRevision: 0,
    activeView: 'board',
    selectedId: null,
    detailOpen: false,
    createOpen: false,
    draft: null,
    announcement: '',
  });
  readonly tabs = KANBAN_TABS;
  readonly activeView = computed(() => this.screen().activeView);
  readonly project = computed(() => this.snapshot()?.project ?? null);
  readonly tasks = computed(() => this.snapshot()?.tasks ?? []);
  readonly search = this.query.asReadonly();
  readonly priorityFilter = this.priority.asReadonly();
  readonly assigneeFilter = this.assignee.asReadonly();
  readonly sortOrder = this.order.asReadonly();
  readonly filterCount = computed(
    () => Number(this.priority() !== 'all') + Number(this.assignee() !== 'all'),
  );
  readonly completed = computed(
    () =>
      this.tasks().filter((task) =>
        this.snapshot()?.columns.some((column) => column.id === task.columnId && column.completed),
      ).length,
  );
  readonly reviewCount = computed(
    () =>
      this.tasks().filter((task) =>
        this.snapshot()?.columns.some((column) => column.id === task.columnId && column.review),
      ).length,
  );
  readonly completion = computed(() =>
    Math.round((this.completed() / Math.max(1, this.tasks().length)) * 100),
  );
  readonly visibleTasks = computed(() => {
    const data = this.snapshot();
    if (!data) return [];
    const query = normalize(this.query().trim());
    const filtered = this.tasks().filter((task) => {
      const category =
        data.categories.find((category) => category.id === task.categoryId)?.label ??
        task.categoryId;
      const tools = task.toolIds
        .map((id) => data.tools.find((tool) => tool.id === id)?.label ?? id)
        .join(' ');
      return (
        (!query || normalize(`${task.code} ${task.title} ${category} ${tools}`).includes(query)) &&
        (this.priority() === 'all' || task.priority === this.priority()) &&
        (this.assignee() === 'all' ||
          task.assignees.some((person) => person.name === this.assignee()))
      );
    });
    const rank = (id: string) =>
      data.priorities.find((priority) => priority.id === id)?.rank ?? Number.MAX_SAFE_INTEGER;
    return filtered.sort((a, b) =>
      this.order() === 'priority'
        ? rank(a.priority) - rank(b.priority) || a.positionY - b.positionY
        : a.positionY - b.positionY,
    );
  });
  /** Source changes rebuild catalog/task views; opening a panel does not invalidate the board. */
  private readonly sourceView = computed(() => {
    const data = this.snapshot();
    if (!data) return null;
    const columns = columnViews(data);
    return {
      columns,
      priorities: data.priorities.map(optionView),
      tasksById: new Map(data.tasks.map((task) => [task.id, taskView(task, data, columns)])),
    };
  });
  private readonly visibleTaskViews = computed(() => {
    const source = this.sourceView();
    return source ? this.visibleTasks().map((task) => source.tasksById.get(task.id)!) : [];
  });
  private readonly boardColumns = computed(() => {
    const source = this.sourceView();
    if (!source) return [];
    const grouped = new Map<ColumnId, KanbanTaskView[]>();
    for (const task of this.visibleTaskViews()) {
      const group = grouped.get(task.columnId);
      if (group) group.push(task);
      else grouped.set(task.columnId, [task]);
    }
    return source.columns.map((column) => ({ ...column, tasks: grouped.get(column.id) ?? [] }));
  });
  readonly view = computed<KanbanViewModel | null>(() => {
    const data = this.snapshot();
    const source = this.sourceView();
    if (!data || !source) return null;
    const screen = this.screen();
    return {
      commentRevision: screen.commentRevision,
      busy: this.saving(),
      error: this.error(),
      canCreateTask: this.initialDraft() !== null,
      project: data.project,
      tabs: KANBAN_TABS,
      activeView: screen.activeView,
      tasks: this.visibleTaskViews(),
      columns: this.boardColumns(),
      columnOptions: source.columns,
      priorityOptions: source.priorities,
      summary: {
        total: this.tasks().length,
        completed: this.completed(),
        review: this.reviewCount(),
        completion: this.completion(),
      },
      search: this.search(),
      priorityFilter: this.priorityFilter(),
      assigneeFilter: this.assigneeFilter(),
      sortOrder: this.sortOrder(),
      filterCount: this.filterCount(),
      hasFilters: !!this.search() || this.filterCount() > 0,
      selectedTask: source.tasksById.get(screen.selectedId ?? '') ?? null,
      detailOpen: screen.detailOpen,
      createOpen: screen.createOpen,
      newTaskDraft: screen.draft,
      announcement: screen.announcement,
    };
  });

  constructor() {
    this.reload();
  }

  dispatch(action: KanbanAction): void {
    switch (action.type) {
      case 'loadRetried':
        this.reload();
        break;
      case 'viewChanged':
        if (KANBAN_TABS.some((tab) => tab.id === action.value))
          this.patchScreen({ activeView: action.value });
        break;
      case 'searchChanged':
        this.setSearch(action.value);
        break;
      case 'priorityChanged':
        this.setPriority(action.value);
        break;
      case 'assigneeChanged':
        this.setAssignee(action.value);
        break;
      case 'orderChanged':
        this.setOrder(action.value === 'priority' ? 'priority' : 'manual');
        break;
      case 'filtersCleared':
        this.clearFilters();
        break;
      case 'taskOpened':
        if (this.tasks().some((task) => task.id === action.id))
          this.patchScreen({ selectedId: action.id, detailOpen: true });
        break;
      case 'newTaskOpened': {
        const draft = this.initialDraft(action.columnId);
        if (draft) this.patchScreen({ draft, createOpen: true });
        break;
      }
      case 'detailVisibilityChanged':
        this.patchScreen({ detailOpen: action.open });
        break;
      case 'createVisibilityChanged':
        this.patchScreen({ createOpen: action.open });
        break;
      case 'taskCreated':
        this.createTask(action.draft);
        break;
      case 'taskChanged':
        this.updateTask(action.id, action.changes);
        break;
      case 'taskMoved':
        this.dropTask(action.move);
        break;
      case 'commentAdded':
        this.addComment(action.id, action.text);
        break;
      case 'commentReactionChanged':
        this.mutate(() => this.source.toggleCommentReaction(action.change));
        break;
      case 'fileDownloaded':
        this.files.download(action.file);
        break;
    }
  }

  setSearch(value: string): void {
    this.query.set(value);
  }
  setPriority(value: string): void {
    this.priority.set(
      this.snapshot()?.priorities.some((option) => option.id === value) ? value : 'all',
    );
  }
  setAssignee(value: string): void {
    this.assignee.set(value);
  }
  setOrder(value: 'manual' | 'priority'): void {
    this.order.set(value);
  }
  clearFilters(): void {
    this.query.set('');
    this.priority.set('all');
    this.assignee.set('all');
  }

  initialDraft(columnId?: ColumnId): TaskDraft | null {
    const data = this.snapshot();
    if (!data) return null;
    const target = columnId ?? data.defaults.columnId;
    if (
      !data.columns.some((column) => column.id === target) ||
      !data.priorities.some((option) => option.id === data.defaults.priority)
    )
      return null;
    return { title: '', description: '', columnId: target!, priority: data.defaults.priority! };
  }
  createTask(draft: TaskDraft): void {
    this.mutate(
      () => this.source.createTask(draft),
      (task) => {
        this.clearFilters();
        this.patchScreen({
          createOpen: false,
          announcement: `Tarea ${task.code} creada en ${this.columnName(task.columnId)}.`,
        });
      },
    );
  }
  updateTask(id: string, changes: TaskChanges): void {
    this.mutate(
      () => this.source.updateTask(id, changes),
      () => {
        this.patchScreen({
          announcement: changes.columnId
            ? `${id}: ${this.columnName(changes.columnId)}.`
            : `${id} actualizada.`,
        });
      },
    );
  }
  moveTask(move: TaskMove): void {
    this.mutate(
      () => this.source.moveTask(move),
      () => {
        this.order.set('manual');
        this.patchScreen({ announcement: `${move.id}: ${this.columnName(move.columnId)}.` });
      },
    );
  }
  addComment(id: string, text: string): void {
    this.mutate(
      () => this.source.addComment(id, text),
      () => {
        this.patchScreen({ commentRevision: this.screen().commentRevision + 1 });
      },
    );
  }
  private dropTask(move: TaskDrop): void {
    const others = this.visibleTasks().filter(
      (task) => task.columnId === move.columnId && task.id !== move.id,
    );
    this.moveTask({
      id: move.id,
      columnId: move.columnId,
      beforeId: others[move.index]?.id ?? null,
    });
  }
  private columnName(id: ColumnId): string {
    return this.snapshot()?.columns.find((column) => column.id === id)?.name ?? id;
  }
  private patchScreen(changes: Partial<KanbanScreenState>): void {
    this.screen.update((screen) => ({ ...screen, ...changes }));
  }
  reload(): void {
    if (this.saving()) return;
    this.loadSubscription?.unsubscribe();
    this.loadingState.set(true);
    this.errorState.set('');
    this.loadSubscription = defer(() => this.source.readBoard())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingState.set(false)),
      )
      .subscribe({
        next: (data) => this.snapshot.set(data),
        error: () => this.errorState.set('No se pudo cargar el tablero. Inténtalo de nuevo.'),
      });
  }

  private mutate<T>(
    request: () => Observable<T>,
    success: (result: T) => void = () => undefined,
  ): void {
    if (this.saving() || this.loading() || !this.snapshot()) return;
    this.savingState.set(true);
    this.errorState.set('');
    defer(request)
      .pipe(
        switchMap((result) => this.source.readBoard().pipe(map((data) => ({ result, data })))),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.savingState.set(false)),
      )
      .subscribe({
        next: ({ result, data }) => {
          this.snapshot.set(data);
          success(result);
        },
        error: () => this.errorState.set('No se pudo guardar el cambio. Vuelve a intentarlo.'),
      });
  }
}
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
