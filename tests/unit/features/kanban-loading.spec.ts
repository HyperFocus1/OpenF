import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Subject } from 'rxjs';
import { KANBAN_SERVICE_TOKEN } from '@configs/tokens';
import { KanbanSnapshot } from '@models/kanban/kanban.model';
import { KanbanMockServiceImpl } from '@core/services/kanban/kanban-mock-impl.service';
import { KanbanPage } from '@features/kanban/kanban-page';

describe('Kanban: carga inicial', () => {
  it('muestra placeholders hasta recibir datos y conserva el encabezado y el foco al terminar', async () => {
    const data = await firstValueFrom(new KanbanMockServiceImpl().readBoard());
    const request = new Subject<KanbanSnapshot>();
    TestBed.overrideProvider(KANBAN_SERVICE_TOKEN, { useValue: { readBoard: () => request } });
    const fixture = TestBed.createComponent(KanbanPage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const header = root.querySelector('header');
    const boardTab = root.querySelector<HTMLButtonElement>('#kanban-panel-tab-board')!;
    expect(root.querySelector('h1')?.textContent).toBe('Tasks');
    expect(root.querySelector('of-kanban-loading')).not.toBeNull();
    expect(root.querySelector('of-kanban')).toBeNull();
    expect(root.querySelector('[aria-label="Nueva tarea"]')).toBeNull();
    expect(root.querySelector('#kanban-panel')?.getAttribute('aria-busy')).toBe('true');
    boardTab.focus();
    request.next(data);
    request.complete();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector('of-kanban-loading')).toBeNull();
    expect(root.querySelectorAll('of-task-card')).toHaveLength(data.tasks.length);
    expect(root.querySelector('header')).toBe(header);
    expect(root.querySelector('#kanban-panel-tab-board')).toBe(boardTab);
    expect(document.activeElement).toBe(boardTab);
    expect(root.getAttribute('aria-busy')).toBeNull();
  });

  it('permite cambiar de pestaña durante la carga y sustituye el skeleton por el error al fallar', () => {
    const request = new Subject<KanbanSnapshot>();
    TestBed.overrideProvider(KANBAN_SERVICE_TOKEN, { useValue: { readBoard: () => request } });
    const fixture = TestBed.createComponent(KanbanPage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('#kanban-panel-tab-list')!.click();
    fixture.detectChanges();
    expect(root.querySelector('of-kanban-loading')).toBeNull();
    expect(root.querySelector('#kanban-panel')?.childElementCount).toBe(0);
    root.querySelector<HTMLButtonElement>('#kanban-panel-tab-board')!.click();
    fixture.detectChanges();
    expect(root.querySelector('of-kanban-loading')).not.toBeNull();
    request.error(new Error('Fallo simulado'));
    fixture.detectChanges();
    expect(root.querySelector('of-kanban-loading')).toBeNull();
    expect(root.querySelector('of-alert')?.textContent).toContain('No se pudo cargar');
    expect(root.textContent).toContain('Reintentar carga');
    expect(root.getAttribute('aria-busy')).toBeNull();
  });
});
