import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  OnChanges,
  output,
  SimpleChanges,
} from '@angular/core';
import { Icon, Tag } from '@shared/ui';
import { ColumnId } from '@models/kanban/kanban.model';
import { BoardColumnView, KanbanTaskView, TaskDrop } from '@models/kanban/kanban-view.model';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'of-kanban-board',
  imports: [
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragPreview,
    CdkDropList,
    CdkDropListGroup,
    Icon,
    Tag,
    TaskCard,
  ],
  host: { class: 'block min-w-0' },
  template: `
    <div
      cdkDropListGroup
      class="-m-0.5 grid items-start [--kanban-column-width:minmax(255px,1fr)] gap-4 overflow-x-auto p-0.5 pb-4 max-[1150px]:[--kanban-column-width:270px] compact:[--kanban-column-width:250px] compact:gap-3"
      [style.grid-template-columns]="'repeat(' + columns().length + ', var(--kanban-column-width))'"
      aria-label="Tablero de tareas"
    >
      @for (column of columns(); track column.id) {
        <section
          class="board-column min-w-0"
          [attr.data-column-id]="column.id"
          [attr.aria-label]="column.label"
        >
          <header class="mb-3 flex h-10 items-center gap-2 border-b border-outline pb-3">
            <h2>
              <of-tag [color]="column.color" class="py-2 text-[10px] font-bold uppercase">{{
                column.label
              }}</of-tag>
            </h2>
            <span
              class="flex size-5 items-center justify-center rounded-full bg-surface text-[10px]"
              >{{ column.tasks.length }}</span><button
              class="ml-auto flex size-7 items-center justify-center rounded-lg border-0 bg-transparent text-content-muted hover:bg-surface-active hover:text-content [--of-icon-size:15px]"
              type="button"
              [attr.aria-label]="'Añadir tarea en ' + column.label"
              [disabled]="!column.canCreateTask"
              (click)="added.emit(column.id)"
            >
              <of-icon name="plus" />
            </button>
            <of-icon
              name="more"
              aria-hidden="true"
              class="text-content-muted [--of-icon-size:15px]"
            />
          </header>
          <div
            cdkDropList
            [cdkDropListData]="column"
            (cdkDropListDropped)="drop($event)"
            class="flex min-h-90 flex-col gap-2.5 rounded-[15px] border border-outline p-2 [&.cdk-drop-list-receiving]:bg-selected [&.cdk-drop-list-receiving]:outline [&.cdk-drop-list-receiving]:outline-primary"
          >
            @for (task of column.tasks; track task.id) {
              <of-task-card
                cdkDrag
                class="relative"
                [attr.data-task-id]="task.id"
                [cdkDragData]="task"
                [cdkDragStartDelay]="{ touch: 200, mouse: 0 }"
                [task]="task"
                (opened)="opened.emit($event)"
              >
                <ng-template cdkDragPreview [matchSize]="true"
                  ><of-task-card [task]="task" aria-hidden="true" class="rotate-[5deg]"
                /></ng-template>
                <ng-template cdkDragPlaceholder
                  ><div
                    aria-hidden="true"
                    class="h-36 rounded-control border border-dashed border-primary bg-selected"
                  ></div
                ></ng-template>
              </of-task-card>
            }
            <button
              class="flex min-h-10 w-full items-center justify-center gap-1 rounded-lg border-0 bg-transparent p-2 text-[11px] hover:bg-surface [--of-icon-size:12px]"
              type="button"
              [disabled]="!column.canCreateTask"
              (click)="added.emit(column.id)"
            >
              <of-icon name="plus" />Añadir tarea
            </button>
          </div>
        </section>
      }
    </div>
  `,
})
export class KanbanBoard implements OnChanges {
  readonly columns = input.required<readonly BoardColumnView[]>();
  readonly opened = output<string>();
  readonly added = output<ColumnId>();
  readonly moved = output<TaskDrop>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly animations = new Map<string, Animation>();
  private skipDropAnimation = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const animation of this.animations.values()) animation.cancel();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['columns']) return;
    // CDK already slides the preview into its placeholder on drop.
    if (this.skipDropAnimation) {
      this.skipDropAnimation = false;
      return;
    }
    if (changes['columns'].firstChange || this.reducedMotion()) return;

    const positions = new Map(
      this.cards().map((card) => [card.dataset['taskId']!, card.getBoundingClientRect()]),
    );
    afterNextRender(() => this.animateLayout(positions), { injector: this.injector });
  }

  protected drop(event: CdkDragDrop<BoardColumnView, BoardColumnView, KanbanTaskView>): void {
    if (
      !event.isPointerOverContainer ||
      (event.previousContainer === event.container && event.previousIndex === event.currentIndex)
    )
      return;
    this.skipDropAnimation = true;
    this.moved.emit({
      id: event.item.data.id,
      columnId: event.container.data.id,
      index: event.currentIndex,
    });
  }

  private cards(): HTMLElement[] {
    return Array.from(
      this.element.nativeElement.querySelectorAll<HTMLElement>(
        'of-task-card[data-task-id]:not(.cdk-drag-placeholder):not(.cdk-drag-dragging)',
      ),
    );
  }

  private reducedMotion(): boolean {
    return (
      this.element.nativeElement.ownerDocument.defaultView?.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      ).matches ?? false
    );
  }

  private animateLayout(positions: ReadonlyMap<string, DOMRect>): void {
    if (this.reducedMotion()) return;
    for (const card of this.cards()) {
      const id = card.dataset['taskId']!;
      const before = positions.get(id);
      if (!before || !card.animate) continue;
      this.animations.get(id)?.cancel();
      const after = card.getBoundingClientRect();
      const x = before.left - after.left;
      const y = before.top - after.top;
      if (Math.abs(x) < 1 && Math.abs(y) < 1) continue;
      const animation = card.animate(
        [
          { transform: `translate(${x}px, ${y}px)`, zIndex: 1 },
          { transform: 'translate(0, 0)', zIndex: 1 },
        ],
        { duration: 240, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
      this.animations.set(id, animation);
      animation.onfinish = () => this.animations.delete(id);
    }
  }
}
