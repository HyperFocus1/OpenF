import { NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Avatar, Icon, Tag } from '@shared/ui';
import { KanbanTaskView } from '@models/kanban/kanban-view.model';

@Component({
  selector: 'of-task-card',
  imports: [Avatar, Icon, NgOptimizedImage, Tag],
  template: `
    <button
      type="button"
      class="task-card flex w-full flex-col items-stretch rounded-[11px] border border-transparent bg-surface-hover p-3 text-left text-content transition-[border-color,box-shadow] hover:border-outline hover:shadow-lg"
      [attr.aria-label]="task().title"
      (click)="opened.emit(task().id)"
    >
      @if (task().cover; as cover) {
        <img
          [ngSrc]="cover.src"
          [alt]="cover.alt"
          [width]="cover.width"
          [height]="cover.height"
          class="mb-2.5 aspect-[1.8] w-full rounded-lg object-cover"
        />
      }
      <span class="flex items-start gap-1.5">
        <span class="flex flex-1 flex-wrap gap-1">
          <of-tag [color]="task().priority.color" [emoji]="task().priority.emoji">{{
            task().priority.label
          }}</of-tag>
          <of-tag [color]="task().category.color">{{ task().category.label }}</of-tag>
        </span>
        <span aria-hidden="true" class="pt-0.5 text-content-muted [--of-icon-size:14px]"
          ><of-icon name="more" class="rotate-90"
        /></span>
      </span>
      <span class="mt-2 text-[13px] leading-[19px] font-medium text-pretty">{{
        task().title
      }}</span>
      <span class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        @for (person of task().assignees; track person.name) {
          <span class="inline-flex items-center gap-1 text-[9px] leading-4">
            <of-avatar [name]="person.name" [src]="person.avatarUrl" size="xs" />{{ person.name }}
          </span>
        }
      </span>
      <span
        class="mt-2 flex items-center gap-3 text-[10px] text-content-muted [--of-icon-size:14px]"
      >
        <span
          class="inline-flex items-center gap-1"
          [attr.aria-label]="task().commentCount + ' comentarios'"
          ><of-icon name="message" />{{ task().commentCount }}</span
        >
        <span
          class="inline-flex items-center gap-1"
          [attr.aria-label]="task().attachmentCount + ' archivos'"
          ><of-icon name="file" />{{ task().attachmentCount }}</span
        >
      </span>
    </button>
  `,
  host: { class: 'block min-w-0' },
})
export class TaskCard {
  readonly task = input.required<KanbanTaskView>();
  readonly opened = output<string>();
}
