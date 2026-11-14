import { isIconName } from '@shared/ui';
import type { IconName, TabOption } from '@shared/ui';
import type { KanbanCatalogItem, KanbanSnapshot, KanbanTask } from '@models/kanban/kanban.model';
import type {
  KanbanColumnView,
  KanbanOptionView,
  KanbanTaskView,
} from '@models/kanban/kanban-view.model';

/** Navigation belongs to the client. Column names, options and task metadata belong to the source. */
export const KANBAN_TABS: readonly TabOption[] = [
  { id: 'board', label: 'Tablero', icon: 'kanban' },
  { id: 'list', label: 'Lista', icon: 'list' },
  { id: 'roadmap', label: 'Roadmap', icon: 'tree' },
];

function icon(value: string, fallback: IconName): IconName {
  return isIconName(value) ? value : fallback;
}
export function optionView(option: KanbanCatalogItem): KanbanOptionView {
  return {
    id: option.id,
    label: option.label,
    icon: icon(option.icon, 'tag'),
    tone: option.tone,
    color: option.color,
    emoji: option.emoji,
    shortLabel: option.shortLabel,
  };
}
export function columnViews(snapshot: KanbanSnapshot): KanbanColumnView[] {
  return [...snapshot.columns]
    .sort((a, b) => a.position - b.position)
    .map((column) => ({
      id: column.id,
      label: column.name,
      icon: icon(column.icon, 'circle'),
      tone: column.tone,
      color: column.color,
      completed: column.completed,
      canCreateTask: snapshot.priorities.some(
        (priority) => priority.id === snapshot.defaults.priority,
      ),
    }));
}
export function taskView(
  task: KanbanTask,
  snapshot: KanbanSnapshot,
  columns: readonly KanbanColumnView[],
): KanbanTaskView {
  const column = columns.find((column) => column.id === task.columnId) ?? {
    id: task.columnId,
    label: 'Columna no disponible',
    icon: 'circle' as const,
    tone: 'neutral' as const,
    completed: false,
    canCreateTask: false,
  };
  const fallback = (id: string): KanbanOptionView => ({
    id,
    label: id,
    icon: 'tag',
    tone: 'neutral',
  });
  const priority = snapshot.priorities.find((option) => option.id === task.priority);
  const category = snapshot.categories.find((option) => option.id === task.categoryId);
  const completionTarget = column.completed
    ? (columns.find((column) => column.id === snapshot.defaults.columnId && !column.completed) ??
      columns.find((column) => !column.completed))
    : columns.find((column) => column.completed);
  return {
    ...task,
    column,
    priority: priority ? optionView(priority) : fallback(task.priority),
    category: category ? optionView(category) : fallback(task.categoryId),
    tags: task.tags.map(optionView),
    detailTabs: [
      { id: 'description', label: 'Descripción' },
      { id: 'comments', label: 'Comentarios', count: task.comments.length },
      { id: 'attachments', label: 'Adjuntos', count: task.files.length },
      { id: 'activity', label: 'Actividad' },
    ],
    tools: task.toolIds.map((id) => {
      const tool = snapshot.tools.find((tool) => tool.id === id);
      return tool ? optionView(tool) : fallback(id);
    }),
    completed: column.completed,
    completionChanges: completionTarget ? { columnId: completionTarget.id } : null,
    completionLabel: column.completed ? 'Reabrir tarea' : 'Marcar como completada',
  };
}
