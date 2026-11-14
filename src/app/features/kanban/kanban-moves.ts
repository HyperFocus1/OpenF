import type { TaskMove } from '@models/kanban/kanban.model';
import type { KanbanTaskView, KanbanViewModel, TaskDrop } from '@models/kanban/kanban-view.model';
import type { OptimisticMove } from './kanban-move.model';

export function pendingMove(view: KanbanViewModel, drop: TaskDrop): OptimisticMove | null {
  const target = view.columns.find((column) => column.id === drop.columnId);
  if (!target || !view.tasks.some((task) => task.id === drop.id)) return null;
  const others = target.tasks.filter((task) => task.id !== drop.id);
  return {
    id: drop.id,
    columnId: drop.columnId,
    beforeIds: others.slice(Math.max(0, drop.index)).map((task) => task.id),
  };
}

export function resolveMove(
  move: OptimisticMove,
  tasks: readonly { id: string; columnId: string }[],
): TaskMove {
  const destination = new Set(
    tasks
      .filter((task) => task.columnId === move.columnId && task.id !== move.id)
      .map((task) => task.id),
  );
  return {
    id: move.id,
    columnId: move.columnId,
    beforeId: move.beforeIds.find((id) => destination.has(id)) ?? null,
  };
}

export function projectMoves(
  view: KanbanViewModel,
  moves: readonly OptimisticMove[],
): KanbanViewModel {
  if (!moves.length) return view;
  const columns = view.columns.map((column) => ({ ...column, tasks: [...column.tasks] }));
  let selectedTask = view.selectedTask;
  for (const move of moves) {
    const target = columns.find((column) => column.id === move.columnId);
    const option = view.columnOptions.find((column) => column.id === move.columnId);
    if (!target || !option) continue;
    const update = (task: KanbanTaskView): KanbanTaskView => {
      const completionTarget = option.completed
        ? view.columnOptions.find(
            (column) =>
              !column.completed &&
              column.id === (task.completed ? task.completionChanges?.columnId : task.columnId),
          )
        : view.columnOptions.find((column) => column.completed);
      return {
        ...task,
        columnId: option.id,
        column: option,
        completed: option.completed,
        completionChanges: completionTarget ? { columnId: completionTarget.id } : null,
        completionLabel: option.completed ? 'Reabrir tarea' : 'Marcar como completada',
      };
    };
    if (selectedTask?.id === move.id) selectedTask = update(selectedTask);
    const task = columns.flatMap((column) => column.tasks).find((task) => task.id === move.id);
    if (!task) continue;
    for (const column of columns) column.tasks = column.tasks.filter((task) => task.id !== move.id);
    const beforeId = resolveMove(move, target.tasks).beforeId;
    const index = target.tasks.findIndex((task) => task.id === beforeId);
    target.tasks.splice(index < 0 ? target.tasks.length : index, 0, update(task));
  }
  return { ...view, columns, tasks: columns.flatMap((column) => column.tasks), selectedTask };
}
