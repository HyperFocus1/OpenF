export type ColumnId = string;
export type TaskPriority = string;
export interface TaskPerson {
  name: string;
  role: string;
  avatarUrl?: string;
}
export interface TaskCover {
  src: string;
  alt: string;
  width: number;
  height: number;
}
export interface TaskFile {
  id: string;
  name: string;
  date: string;
  content: string;
}
export interface TaskComment {
  id: string;
  author: string;
  text: string;
  date: string;
  avatarUrl?: string;
  reactions: TaskReaction[];
}
export interface TaskReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}
export interface TaskActivity {
  id: string;
  author: string;
  avatarUrl?: string;
  text: string;
  date: string;
}
export interface TaskReactionChange {
  taskId: string;
  commentId: string;
  emoji: string;
}
export interface KanbanTask {
  id: string;
  code: string;
  positionY: number;
  title: string;
  description: string;
  columnId: ColumnId;
  priority: TaskPriority;
  categoryId: string;
  toolIds: string[];
  assignees: TaskPerson[];
  due: string;
  amount: string;
  areas: string[];
  contact: string;
  social: string;
  files: TaskFile[];
  comments: TaskComment[];
  tags: KanbanCatalogItem[];
  activity: TaskActivity[];
  commentCount: number;
  attachmentCount: number;
  cover: TaskCover | null;
  bookmarked: boolean;
  startWeek: number;
  duration: number;
}

export interface TaskDraft {
  title: string;
  description: string;
  columnId: ColumnId;
  priority: TaskPriority;
}
export type TaskChanges = Partial<Pick<KanbanTask, 'columnId' | 'priority' | 'bookmarked'>>;
export interface TaskMove {
  id: string;
  columnId: ColumnId;
  beforeId: string | null;
}
export interface KanbanProject {
  accessLabel: string;
  status: KanbanCatalogItem;
  name: string;
  code: string;
  workspace: string;
  tagline: string;
  description: string;
  sprintGoal: string;
  teamName: string;
  members: TaskPerson[];
  currentUser: TaskPerson;
  dateRange: string;
  dueDate: string;
  dueShort: string;
  year: number;
  areas: string[];
  weeks: string[];
  roadmapTitle: string;
  contact: string;
  social: string;
}
/** Data supplied by the source; IDs, names, ordering and available options are not UI constants. */
export interface KanbanCatalogItem {
  id: string;
  label: string;
  icon: string;
  tone: 'neutral' | 'primary' | 'danger';
  color?: string;
  emoji?: string;
  shortLabel?: string;
}
export interface KanbanPriority extends KanbanCatalogItem {
  rank: number;
}
export interface KanbanColumn {
  id: ColumnId;
  projectId: string;
  name: string;
  position: number;
  color: string;
  icon: string;
  tone: 'neutral' | 'primary' | 'danger';
  completed: boolean;
  review: boolean;
}
export interface KanbanSnapshot {
  project: KanbanProject;
  columns: KanbanColumn[];
  priorities: KanbanPriority[];
  categories: KanbanCatalogItem[];
  tools: KanbanCatalogItem[];
  defaults: {
    columnId: ColumnId | null;
    priority: TaskPriority | null;
    categoryId: string;
    toolIds: string[];
  };
  tasks: KanbanTask[];
}
