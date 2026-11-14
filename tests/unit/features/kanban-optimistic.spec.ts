import { CdkDropList } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { firstValueFrom, of, Subject } from 'rxjs';
import { KANBAN_SERVICE_TOKEN } from '@configs/tokens';
import { KanbanMockServiceImpl } from '@core/services/kanban/kanban-mock-impl.service';
import { KanbanStateService } from '@core/services/kanban/kanban-state.service';
import { KanbanSnapshot } from '@models/kanban/kanban.model';
import { KanbanBoard } from '@features/kanban/components/kanban-board/kanban-board';
import { KanbanPage } from '@features/kanban/kanban-page';
import { KanbanUiStateService } from '@features/kanban/kanban-ui-state.service';

let initial: KanbanSnapshot;

beforeAll(async () => {
  initial = await firstValueFrom(new KanbanMockServiceImpl().readBoard());
});

function boardPage() {
  const data = structuredClone(initial);
  const mutation = new Subject<void>();
  const refresh = new Subject<KanbanSnapshot>();
  const source = {
    readBoard: vi.fn().mockReturnValueOnce(of(data)).mockReturnValue(refresh),
    moveTask: vi.fn(() => mutation),
  };
  TestBed.overrideComponent(KanbanPage, {
    add: {
      providers: [{ provide: KANBAN_SERVICE_TOKEN, useValue: source }],
    },
  });
  const fixture = TestBed.createComponent(KanbanPage);
  fixture.detectChanges();
  const board = fixture.debugElement.query(By.directive(KanbanBoard));
  const root = fixture.nativeElement as HTMLElement;
  const ids = (columnId: string) =>
    Array.from(
      root.querySelectorAll<HTMLElement>(`[data-column-id="${columnId}"] [data-task-id]`),
    ).map((card) => card.dataset['taskId']);
  const move = (id: string, columnId: string, index: number) => {
    board.componentInstance.moved.emit({ id, columnId, index });
    fixture.detectChanges();
  };
  return { fixture, board, root, data, source, mutation, refresh, ids, move };
}

describe('Kanban: estado de UI y movimientos optimistas', () => {
  afterEach(() => vi.restoreAllMocks());

  it('aísla el estado por página y descarta la cola al destruir su componente', () => {
    const { fixture, source, mutation, move } = boardPage();
    source.readBoard.mockReturnValue(of(structuredClone(initial)));
    const second = TestBed.createComponent(KanbanPage);
    second.detectChanges();
    const firstState = fixture.debugElement.injector.get(KanbanUiStateService);
    const secondState = second.debugElement.injector.get(KanbanUiStateService);
    expect(firstState).not.toBe(secondState);

    move('OF-001', 'todo', 0);
    move('OF-002', 'review', 0);
    expect(firstState.savingMoves()).toBe(true);
    expect(secondState.savingMoves()).toBe(false);
    expect(
      secondState.view()!.columns.find((column) => column.id === 'backlog')!.tasks,
    ).toHaveLength(3);

    fixture.destroy();
    mutation.next();
    mutation.complete();
    second.detectChanges();
    expect(source.moveTask).toHaveBeenCalledTimes(1);
    expect(source.readBoard).toHaveBeenCalledTimes(2);
    expect(secondState.savingMoves()).toBe(false);
  });

  it('mueve inmediatamente, mantiene la tarjeta durante el refresco y confirma el orden recibido', () => {
    const { fixture, root, data, source, mutation, refresh, ids, move } = boardPage();
    const original = structuredClone(data);
    move('OF-001', 'todo', 1);

    expect(ids('backlog')).toEqual(['OF-002', 'OF-003']);
    expect(ids('todo')).toEqual(['OF-004', 'OF-001', 'OF-005', 'OF-006']);
    expect(root.textContent).toContain('Guardando cambios');
    expect(source.moveTask).toHaveBeenCalledWith({
      id: 'OF-001',
      columnId: 'todo',
      beforeId: 'OF-005',
    });
    expect(data).toEqual(original);

    mutation.next();
    mutation.complete();
    fixture.detectChanges();
    expect(source.readBoard).toHaveBeenCalledTimes(2);
    expect(ids('todo')[1]).toBe('OF-001');
    expect(root.textContent).toContain('Guardando cambios');

    const confirmed = structuredClone(data);
    Object.assign(
      confirmed.tasks.find((task) => task.id === 'OF-001')!,
      {
        columnId: 'todo',
        positionY: 450,
      },
    );
    refresh.next(confirmed);
    refresh.complete();
    fixture.detectChanges();
    expect(ids('todo')).toEqual(['OF-004', 'OF-001', 'OF-005', 'OF-006']);
    expect(root.textContent).not.toContain('Guardando cambios');
  });

  it('restaura columna y posición originales si falla el movimiento y permite reintentar', () => {
    const { fixture, root, source, mutation, ids, move } = boardPage();
    const backlog = ids('backlog');
    const todo = ids('todo');
    move('OF-002', 'todo', 0);
    expect(ids('todo')[0]).toBe('OF-002');
    mutation.error(new Error('Fallo simulado'));
    fixture.detectChanges();
    expect(ids('backlog')).toEqual(backlog);
    expect(ids('todo')).toEqual(todo);
    expect(root.querySelector('of-alert')?.textContent).toContain('No se pudo guardar');
    expect(root.querySelector('fieldset')?.disabled).toBe(false);

    source.moveTask.mockReturnValue(new Subject<void>());
    move('OF-002', 'todo', 2);
    expect(ids('todo')[2]).toBe('OF-002');
    expect(source.moveTask).toHaveBeenCalledTimes(2);
  });

  it('revierte también si falla la lectura de confirmación', () => {
    const { fixture, mutation, refresh, ids, move } = boardPage();
    move('OF-001', 'done', 0);
    mutation.next();
    mutation.complete();
    refresh.error(new Error('No se pudo refrescar'));
    fixture.detectChanges();
    expect(ids('backlog')[0]).toBe('OF-001');
    expect(ids('done')).not.toContain('OF-001');
  });

  it('reordena la misma columna con filtros y restaura el orden si falla', () => {
    const { fixture, board, mutation, source, ids, move } = boardPage();
    const state = fixture.debugElement.injector.get(KanbanStateService);
    state.setSearch('Inventory');
    fixture.detectChanges();
    // The hidden tasks must not affect the insertion index sent to the service.
    move('OF-003', 'todo', 0);
    expect(ids('todo')).toEqual(['OF-003', 'OF-006']);
    expect(source.moveTask).toHaveBeenLastCalledWith({
      id: 'OF-003',
      columnId: 'todo',
      beforeId: 'OF-006',
    });
    mutation.error(new Error('Fallo simulado'));
    fixture.detectChanges();
    expect(ids('backlog')).toEqual(['OF-003']);
    expect(ids('todo')).toEqual(['OF-006']);

    state.clearFilters();
    fixture.detectChanges();
    source.moveTask.mockReturnValue(new Subject<void>());
    board.componentInstance.moved.emit({ id: 'OF-001', columnId: 'backlog', index: 2 });
    fixture.detectChanges();
    expect(ids('backlog')).toEqual(['OF-002', 'OF-003', 'OF-001']);
    expect(source.moveTask).toHaveBeenLastCalledWith({
      id: 'OF-001',
      columnId: 'backlog',
      beforeId: null,
    });
  });

  it('ignora drops sin cambios, pero mueve otras tarjetas sin esperar la petición pendiente', () => {
    const { fixture, board, source, mutation, ids, move } = boardPage();
    const list = board.query(By.directive(CdkDropList));
    const container = list.injector.get(CdkDropList);
    const event = {
      previousContainer: container,
      container,
      previousIndex: 0,
      currentIndex: 0,
      isPointerOverContainer: true,
      item: { data: { id: 'OF-001' } },
    };
    list.triggerEventHandler('cdkDropListDropped', event);
    list.triggerEventHandler('cdkDropListDropped', {
      ...event,
      currentIndex: 1,
      isPointerOverContainer: false,
    });
    expect(source.moveTask).not.toHaveBeenCalled();
    move('OF-001', 'todo', 0);
    source.moveTask.mockReturnValueOnce(new Subject<void>());
    move('OF-002', 'todo', 0);
    expect(ids('backlog')).toEqual(['OF-003']);
    expect(ids('todo').slice(0, 2)).toEqual(['OF-002', 'OF-001']);
    expect(source.moveTask).toHaveBeenCalledTimes(1);

    mutation.error(new Error('Falló solo la primera tarjeta'));
    fixture.detectChanges();
    expect(ids('backlog')).toEqual(['OF-001', 'OF-003']);
    expect(ids('todo')[0]).toBe('OF-002');
    expect(source.moveTask).toHaveBeenCalledTimes(2);
    expect(source.moveTask).toHaveBeenLastCalledWith({
      id: 'OF-002',
      columnId: 'todo',
      beforeId: 'OF-004',
    });
  });

  it('permite abrir toda una tarjeta con portada mientras se guarda otra', async () => {
    const { fixture, root, move } = boardPage();
    move('OF-001', 'review', 0);
    const card = root.querySelector<HTMLButtonElement>('[data-task-id="OF-006"] button')!;
    const image = card.querySelector('img')!;
    expect(card.matches(':disabled')).toBe(false);
    expect(image.draggable).toBe(false);
    image.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const detail = document.querySelector('[role="dialog"][aria-label="Detalle de tarea"]')!;
    expect(detail.textContent).toContain('Inventory Overview');
  });

  it('mantiene el último movimiento de la misma tarjeta aunque falle el anterior', () => {
    const { fixture, source, mutation, refresh, data, ids, move } = boardPage();
    const second = new Subject<void>();
    move('OF-001', 'todo', 0);
    source.moveTask.mockReturnValueOnce(second);
    move('OF-001', 'done', 0);
    expect(ids('done')[0]).toBe('OF-001');
    expect(ids('todo')).not.toContain('OF-001');
    mutation.error(new Error('Falló el primer destino'));
    fixture.detectChanges();
    expect(ids('done')[0]).toBe('OF-001');
    expect(source.moveTask).toHaveBeenLastCalledWith({
      id: 'OF-001',
      columnId: 'done',
      beforeId: 'OF-010',
    });

    second.next();
    second.complete();
    const confirmed = structuredClone(data);
    Object.assign(confirmed.tasks[0], { columnId: 'done', positionY: 0 });
    refresh.next(confirmed);
    refresh.complete();
    fixture.detectChanges();
    expect(ids('done')[0]).toBe('OF-001');
    expect(ids('backlog')).not.toContain('OF-001');
  });

  it('conserva el primer movimiento confirmado cuando falla la segunda tarjeta', () => {
    const { fixture, source, mutation, refresh, data, ids, move } = boardPage();
    const second = new Subject<void>();
    move('OF-001', 'todo', 0);
    source.moveTask.mockReturnValueOnce(second);
    move('OF-002', 'review', 0);
    expect(ids('todo')[0]).toBe('OF-001');
    expect(ids('review')[0]).toBe('OF-002');

    mutation.next();
    mutation.complete();
    const confirmed = structuredClone(data);
    Object.assign(confirmed.tasks[0], { columnId: 'todo', positionY: 0 });
    refresh.next(confirmed);
    refresh.complete();
    fixture.detectChanges();
    expect(ids('review')[0]).toBe('OF-002');
    second.error(new Error('Falló solo la segunda tarjeta'));
    fixture.detectChanges();
    expect(ids('todo')[0]).toBe('OF-001');
    expect(ids('review')).not.toContain('OF-002');
    expect(ids('backlog')[0]).toBe('OF-002');
  });

  it.each([false, true])(
    'desliza la tarjeta al volver y respeta movimiento reducido (%s)',
    async (reducedMotion) => {
      const previousAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
      const animate = vi.fn(() => ({ cancel: vi.fn(), onfinish: null }) as unknown as Animation);
      Object.defineProperty(HTMLElement.prototype, 'animate', {
        configurable: true,
        value: animate,
      });
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: reducedMotion })),
      );
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        const column = this.closest<HTMLElement>('[data-column-id]')?.dataset['columnId'];
        const x = ['backlog', 'todo', 'review', 'done'].indexOf(column ?? '') * 300;
        const siblings = Array.from(this.parentElement?.querySelectorAll('[data-task-id]') ?? []);
        return new DOMRect(x, siblings.indexOf(this) * 150, 270, 140);
      });
      try {
        const { fixture, board, mutation, ids } = boardPage();
        const lists = board.queryAll(By.directive(CdkDropList));
        lists[1].triggerEventHandler('cdkDropListDropped', {
          previousContainer: lists[0].injector.get(CdkDropList),
          container: lists[1].injector.get(CdkDropList),
          previousIndex: 0,
          currentIndex: 0,
          isPointerOverContainer: true,
          item: { data: { id: 'OF-001' } },
        });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(ids('todo')[0]).toBe('OF-001');
        expect(animate).not.toHaveBeenCalled();

        mutation.error(new Error('Fallo simulado'));
        fixture.detectChanges();
        await fixture.whenStable();
        expect(ids('backlog')[0]).toBe('OF-001');
        if (reducedMotion) {
          expect(animate).not.toHaveBeenCalled();
        } else {
          const index = animate.mock.contexts.findIndex(
            (card) => (card as unknown as HTMLElement).dataset['taskId'] === 'OF-001',
          );
          expect(index).toBeGreaterThanOrEqual(0);
          expect(animate.mock.calls[index]).toEqual([
            [
              { transform: 'translate(300px, 0px)', zIndex: 1 },
              { transform: 'translate(0, 0)', zIndex: 1 },
            ],
            expect.objectContaining({ duration: 240 }),
          ]);
        }
      } finally {
        if (previousAnimate)
          Object.defineProperty(HTMLElement.prototype, 'animate', previousAnimate);
        else Reflect.deleteProperty(HTMLElement.prototype, 'animate');
        vi.unstubAllGlobals();
      }
    },
  );
});
