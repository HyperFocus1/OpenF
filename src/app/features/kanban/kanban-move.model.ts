import type { ColumnId } from '@models/kanban/kanban.model';

/** Ordered anchors survive failed earlier moves and changes to the visible filters. */
export interface OptimisticMove {
  id: string;
  columnId: ColumnId;
  beforeIds: readonly string[];
}
