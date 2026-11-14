import { Component, computed, input, linkedSignal, output } from '@angular/core';
import {
  form,
  FormField as SignalField,
  maxLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { Alert, Button, FormField, Input } from '@shared/ui';
import { TaskDraft } from '@models/kanban/kanban.model';
import { KanbanColumnView, KanbanOptionView } from '@models/kanban/kanban-view.model';

@Component({
  selector: 'of-new-task',
  imports: [Alert, Button, FormField, Input, SignalField],
  template: `
    <h2 class="text-[26px] leading-snug font-medium tracking-tight">Nueva tarea</h2>
    <p class="mt-2 mb-7 text-[13px] text-content-muted">Dale espacio a tu próxima idea.</p>
    @if (error()) {
      <of-alert class="mb-5">{{ error() }}</of-alert>
    }
    <form
      class="flex flex-col gap-6 [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-control [&_textarea]:border [&_textarea]:border-[var(--of-input-outline)] [&_textarea]:bg-surface [&_textarea]:p-3 [&_textarea]:font-sans [&_textarea]:text-[13px] [&_textarea]:text-content [&_textarea]:placeholder:text-content-muted [&_select]:w-full [&_select]:rounded-control [&_select]:border [&_select]:border-[var(--of-input-outline)] [&_select]:bg-surface [&_select]:p-3 [&_select]:text-[13px] [&_select]:text-content"
      novalidate
      (submit)="onSubmit($event)"
    >
      <fieldset class="m-0 flex min-w-0 flex-col gap-6 border-0 p-0" [disabled]="busy()">
        <of-form-field label="Nombre de la tarea" controlId="new-task-title" [error]="titleError()">
          <input
            id="new-task-title"
            ofInput
            placeholder=" "
            [formField]="taskForm.title"
            [ofInvalid]="!!titleError()"
            [attr.aria-describedby]="titleError() ? 'new-task-title-error' : null"
          />
        </of-form-field>
        <label class="flex min-w-0 flex-1 flex-col gap-2 text-xs text-content-muted"
          >Descripción<textarea
            rows="5"
            placeholder="¿Qué vamos a hacer?"
            [formField]="taskForm.description"
          ></textarea>
        </label>
        <div class="flex gap-4">
          <label class="flex min-w-0 flex-1 flex-col gap-2 text-xs text-content-muted"
            >Estado<select aria-label="Estado" [formField]="taskForm.columnId">
              @for (column of columns(); track column.id) {
                <option [value]="column.id">{{ column.label }}</option>
              }
            </select></label
          ><label class="flex min-w-0 flex-1 flex-col gap-2 text-xs text-content-muted"
            >Prioridad<select aria-label="Prioridad" [formField]="taskForm.priority">
              @for (priority of priorities(); track priority.id) {
                <option [value]="priority.id">{{ priority.label }}</option>
              }
            </select></label
          >
        </div>
        <button ofButton="primary" icon="plus" type="submit" [busy]="busy()">
          {{ busy() ? 'Creando tarea…' : 'Crear tarea' }}
        </button>
      </fieldset>
    </form>
  `,
  host: { class: 'block' },
})
export class NewTask {
  readonly busy = input(false);
  readonly error = input('');
  readonly initialValue = input.required<TaskDraft>();
  readonly created = output<TaskDraft>();
  private readonly draft = linkedSignal(() => ({ ...this.initialValue() }));
  readonly columns = input.required<readonly KanbanColumnView[]>();
  readonly priorities = input.required<readonly KanbanOptionView[]>();
  protected readonly taskForm = form(this.draft, (path) => {
    required(path.title, { message: 'Escribe el nombre de la tarea.' });
    maxLength(path.title, 140, { message: 'Usa un máximo de 140 caracteres.' });
    validate(path.title, ({ value }) =>
      value().trim() ? null : { kind: 'blank', message: 'Escribe el nombre de la tarea.' },
    );
  });
  protected readonly titleError = computed(() =>
    this.taskForm.title().touched() ? (this.taskForm.title().errors()[0]?.message ?? null) : null,
  );

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.taskForm, {
      action: async () => {
        this.created.emit({
          ...this.draft(),
          title: this.draft().title.trim(),
          description: this.draft().description.trim(),
        });
      },
    });
  }
}
