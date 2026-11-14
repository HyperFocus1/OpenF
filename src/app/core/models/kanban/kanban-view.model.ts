import type { BadgeTone, IconName, TabOption } from '@shared/ui';
import type {
  ColumnId,
  KanbanProject,
  KanbanTask,
  TaskChanges,
  TaskDraft,
  TaskFile,
  TaskReactionChange,
} from './kanban.model';

export interface KanbanOptionView {
  id: string;
  label: string;
  icon: IconName;
  tone: BadgeTone;
  color?: string;
  emoji?: string;
  shortLabel?: string;
}
export interface KanbanColumnView extends KanbanOptionView {
  completed: boolean;
  canCreateTask: boolean;
}
export interface KanbanTaskView extends Omit<
  KanbanTask,
  'priority' | 'categoryId' | 'toolIds' | 'tags'
> {
  priority: KanbanOptionView;
  column: KanbanColumnView;
  category: KanbanOptionView;
  tools: KanbanOptionView[];
  tags: KanbanOptionView[];
  detailTabs: readonly TabOption[];
  completed: boolean;
  completionChanges: TaskChanges | null;
  completionLabel: string;
}
export interface BoardColumnView extends KanbanColumnView {
  tasks: KanbanTaskView[];
}
export interface TaskDrop {
  id: string;
  columnId: ColumnId;
  index: number;
}
export interface KanbanSummary {
  total: number;
  completed: number;
  review: number;
  completion: number;
}
export interface KanbanViewModel {
  commentRevision: number;
  busy: boolean;
  error: string;
  canCreateTask: boolean;
  project: KanbanProject;
  tabs: readonly TabOption[];
  activeView: string;
  tasks: KanbanTaskView[];
  columns: BoardColumnView[];
  columnOptions: KanbanColumnView[];
  priorityOptions: KanbanOptionView[];
  summary: KanbanSummary;
  search: string;
  priorityFilter: string;
  assigneeFilter: string;
  sortOrder: string;
  filterCount: number;
  hasFilters: boolean;
  selectedTask: KanbanTaskView | null;
  detailOpen: boolean;
  createOpen: boolean;
  newTaskDraft: TaskDraft | null;
  announcement: string;
}
export type KanbanAction =
  | { type: 'loadRetried' }
  | { type: 'viewChanged'; value: string }
  | { type: 'searchChanged'; value: string }
  | { type: 'priorityChanged'; value: string }
  | { type: 'assigneeChanged'; value: string }
  | { type: 'orderChanged'; value: string }
  | { type: 'filtersCleared' }
  | { type: 'taskOpened'; id: string }
  | { type: 'newTaskOpened'; columnId?: ColumnId }
  | { type: 'detailVisibilityChanged'; open: boolean }
  | { type: 'createVisibilityChanged'; open: boolean }
  | { type: 'taskCreated'; draft: TaskDraft }
  | { type: 'taskChanged'; id: string; changes: TaskChanges }
  | { type: 'taskMoved'; move: TaskDrop }
  | { type: 'commentAdded'; id: string; text: string }
  | { type: 'commentReactionChanged'; change: TaskReactionChange }
  | { type: 'fileDownloaded'; file: TaskFile };
