import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { Component, input, output } from '@angular/core';
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
                [cdkDragDisabled]="busy()"
                [cdkDragData]="task"
                [cdkDragStartDelay]="{ touch: 200, mouse: 0 }"
                [task]="task"
                (opened)="opened.emit($event)"
              >
                <ng-template cdkDragPreview [matchSize]="true"
                  ><of-task-card
                    [task]="task"
                    aria-hidden="true"
                    data-theme="dark"
                    class="rotate-[5deg]"
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
export class KanbanBoard {
  readonly busy = input(false);
  readonly columns = input.required<readonly BoardColumnView[]>();
  readonly opened = output<string>();
  readonly added = output<ColumnId>();
  readonly moved = output<TaskDrop>();

  protected drop(event: CdkDragDrop<BoardColumnView, BoardColumnView, KanbanTaskView>): void {
    this.moved.emit({
      id: event.item.data.id,
      columnId: event.container.data.id,
      index: event.currentIndex,
    });
  }
}
