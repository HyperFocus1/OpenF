import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  model,
  output,
  viewChild,
} from '@angular/core';
import { Alert, Avatar, Dropdown, Icon, Tabs, Tag } from '@shared/ui';
import { TaskComment, TaskFile, TaskChanges } from '@models/kanban/kanban.model';
import {
  KanbanTaskView,
  KanbanColumnView,
  KanbanOptionView,
} from '@models/kanban/kanban-view.model';

import {
  form,
  disabled,
  FormField as SignalField,
  maxLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';

@Component({
  selector: 'of-task-detail',
  imports: [Alert, Avatar, Dropdown, Icon, SignalField, Tabs, Tag],
  templateUrl: './task-detail.html',
  host: { class: 'flex min-h-full flex-col' },
})
export class TaskDetail {
  readonly busy = input(false);
  readonly error = input('');
  readonly commentRevision = input(0);
  readonly task = input.required<KanbanTaskView>();
  readonly changed = output<TaskChanges>();
  readonly columns = input.required<readonly KanbanColumnView[]>();
  readonly priorities = input.required<readonly KanbanOptionView[]>();
  readonly year = input.required<number>();
  readonly commented = output<string>();
  readonly downloaded = output<TaskFile>();
  readonly closed = output<void>();
  readonly expanded = model(false);
  readonly reacted = output<{ commentId: string; emoji: string }>();
  protected readonly activeTab = linkedSignal({
    source: () => this.task().id,
    computation: () => 'comments',
  });
  private readonly commentInput = viewChild<ElementRef<HTMLTextAreaElement>>('commentInput');
  private readonly injector = inject(Injector);
  private readonly commentDraft = linkedSignal({
    source: () => `${this.task().id}:${this.commentRevision()}`,
    computation: () => ({ text: '' }),
  });
  protected readonly commentForm = form(this.commentDraft, (path) => {
    disabled(path.text, () => this.busy());
    required(path.text);
    maxLength(path.text, 2000);
    validate(path.text, ({ value }) => (value().trim() ? null : { kind: 'blank' }));
  });

  protected setStatus(value: string): void {
    this.changed.emit({ columnId: value });
  }

  protected setPriority(value: string): void {
    this.changed.emit({ priority: value });
  }

  protected focusComposer(): void {
    this.activeTab.set('comments');
    afterNextRender(() => this.commentInput()?.nativeElement.focus(), { injector: this.injector });
  }

  protected reply(comment: TaskComment): void {
    this.commentDraft.set({ text: `@${comment.author} ` });
    this.focusComposer();
  }

  protected async addComment(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.commentForm, {
      action: async () => {
        this.commented.emit(this.commentDraft().text.trim());
      },
    });
  }
}
