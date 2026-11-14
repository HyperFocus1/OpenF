import { DOCUMENT, inject, Service } from '@angular/core';
import { TaskFile } from '@models/kanban/kanban.model';

@Service()
export class LocalFileService {
  private readonly document = inject(DOCUMENT);

  download(file: TaskFile): void {
    const url = URL.createObjectURL(new Blob([file.content], { type: 'text/plain;charset=utf-8' }));
    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = `${file.name}.txt`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
