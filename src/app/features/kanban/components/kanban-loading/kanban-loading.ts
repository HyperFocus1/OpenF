import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { Skeleton } from '@shared/ui';

/** Neutral layout placeholders, without domain records, labels or interactive controls. */
@Component({
  selector: 'of-kanban-loading',
  imports: [NgTemplateOutlet, Skeleton],
  host: { class: 'block min-w-0' },
  templateUrl: './kanban-loading.html',
})
export class KanbanLoading {}
