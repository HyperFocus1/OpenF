import {
  KanbanSnapshot,
  KanbanTask,
  TaskChanges,
  TaskDraft,
  TaskMove,
  TaskReactionChange,
} from '@models/kanban/kanban.model';
import type { Observable } from 'rxjs';

/** Data contract. The current implementation is exclusively in memory. */
export interface KanbanService {
  readBoard(): Observable<KanbanSnapshot>;
  createTask(draft: TaskDraft): Observable<KanbanTask>;
  updateTask(id: string, changes: TaskChanges): Observable<void>;
  moveTask(move: TaskMove): Observable<void>;
  addComment(id: string, text: string): Observable<void>;
  toggleCommentReaction(change: TaskReactionChange): Observable<void>;
}
