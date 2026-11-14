import { Component, input, output } from '@angular/core';
import { KanbanAction, KanbanViewModel } from '@models/kanban/kanban-view.model';
import { Alert, Avatar, Button, Drawer, Dropdown, Icon } from '@shared/ui';
import { KanbanBoard } from './components/kanban-board/kanban-board';
import { NewTask } from './components/new-task/new-task';
import { TaskDetail } from './components/task-detail/task-detail';
@Component({
  selector: 'of-kanban',
  imports: [Alert, Avatar, Button, Drawer, Dropdown, Icon, KanbanBoard, NewTask, TaskDetail],
  templateUrl: './kanban.html',
  host: { class: 'block min-w-0' },
})
export class Kanban {
  readonly view = input.required<KanbanViewModel>();
  readonly action = output<KanbanAction>();
}
