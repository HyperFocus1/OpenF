import type { TaskDraft } from '@models/kanban/kanban.model';

/** Interaction state; independent of backend records and presentational components. */
export interface KanbanScreenState {
  commentRevision: number;
  activeView: string;
  selectedId: string | null;
  detailOpen: boolean;
  createOpen: boolean;
  draft: TaskDraft | null;
  announcement: string;
}
