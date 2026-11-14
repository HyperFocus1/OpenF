import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { provideKanban } from '@configs/kanban.providers';
import { KANBAN_SERVICE_TOKEN } from '@configs/tokens';
import { KanbanStateService } from '@core/services/kanban/kanban-state.service';
import { KanbanMockServiceImpl } from '@core/services/kanban/kanban-mock-impl.service';

async function readyState() {
  const state = TestBed.inject(KanbanStateService);
  await vi.waitFor(() => expect(state.view()).not.toBeNull(), { timeout: 3000 });
  return state;
}
async function saved(state: KanbanStateService) {
  await vi.waitFor(() => expect(state.saving()).toBe(false), { timeout: 3000 });
}

describe('Kanban: contrato mock y estado asíncrono', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideKanban(),
        {
          provide: HttpClient,
          useFactory: () => {
            throw new Error('El Kanban mock no debe usar HTTP');
          },
        },
      ],
    }),
  );

  it('resuelve el contrato por DI y expone carga hasta que llega el Observable', async () => {
    expect(TestBed.inject(KANBAN_SERVICE_TOKEN)).toBeInstanceOf(KanbanMockServiceImpl);
    const state = TestBed.inject(KanbanStateService);
    expect(state.loading()).toBe(true);
    expect(state.view()).toBeNull();
    expect(state.tasks()).toEqual([]);
    await readyState();
    expect(state.loading()).toBe(false);
    expect(state.tasks()).toHaveLength(11);
  });

  it('aísla snapshots e instancias de las constantes privadas', async () => {
    const source = TestBed.inject(KANBAN_SERVICE_TOKEN);
    const snapshot = await firstValueFrom(source.readBoard());
    snapshot.tasks[0].title = 'Modificación externa';
    snapshot.project.members[0].name = 'Otro nombre';
    const stored = await firstValueFrom(source.readBoard());
    expect(stored.tasks[0].title).not.toBe('Modificación externa');
    expect(stored.project.members[0].name).not.toBe('Otro nombre');
    await firstValueFrom(
      source.createTask({
        title: 'Tarea local',
        description: '',
        columnId: 'todo',
        priority: 'low',
      }),
    );
    expect((await firstValueFrom(new KanbanMockServiceImpl().readBoard())).tasks).toHaveLength(11);
  });

  it('mantiene guardado activo, bloquea duplicados y aplica el resultado al terminar', async () => {
    const state = await readyState();
    state.setSearch('sin coincidencias');
    state.setPriority('high');
    const draft = { ...state.initialDraft('review')!, title: '  Revisar propuesta  ' };
    state.createTask(draft);
    state.createTask(draft);
    expect(state.saving()).toBe(true);
    expect(state.tasks()).toHaveLength(11);
    await saved(state);
    const task = state.tasks().find((task) => task.title === 'Revisar propuesta')!;
    expect(task.columnId).toBe('review');
    expect(task.assignees).toEqual([state.project()!.currentUser]);
    expect(task.due).toBe(state.project()!.dueShort);
    expect(task.files).toEqual([]);
    expect(state.tasks()).toHaveLength(12);
    expect(state.visibleTasks()).toHaveLength(12);
    expect(state.filterCount()).toBe(0);
  });

  it('emite errores de validación a través del Observable', async () => {
    const source = TestBed.inject(KANBAN_SERVICE_TOKEN);
    const invalid = [
      { title: '  ', description: '', columnId: 'todo', priority: 'low' },
      { title: 'a'.repeat(141), description: '', columnId: 'todo', priority: 'low' },
      { title: 'Nueva', description: '', columnId: 'inexistente', priority: 'low' },
      { title: 'Nueva', description: '', columnId: 'todo', priority: 'inexistente' },
    ];
    await Promise.all(
      invalid.map((draft) => expect(firstValueFrom(source.createTask(draft))).rejects.toThrow()),
    );
    expect((await firstValueFrom(source.readBoard())).tasks).toHaveLength(11);
  });

  it('combina búsqueda y filtros sin alterar los totales', async () => {
    const state = await readyState();
    state.setSearch('certificates');
    expect(state.visibleTasks()).toHaveLength(1);
    state.clearFilters();
    state.setSearch('design');
    expect(state.visibleTasks().length).toBeGreaterThan(0);
    state.clearFilters();
    state.setPriority('high');
    state.setAssignee('Ana García');
    expect(state.visibleTasks()).toHaveLength(4);
    expect(state.filterCount()).toBe(2);
    expect(state.tasks()).toHaveLength(11);
    expect(state.reviewCount()).toBe(3);
  });

  it('actualiza tareas y recalcula el progreso al recibir la respuesta', async () => {
    const state = await readyState();
    state.updateTask('OF-007', { columnId: 'done', priority: 'low', bookmarked: true });
    expect(state.completed()).toBe(2);
    await saved(state);
    expect(state.completed()).toBe(3);
    expect(state.reviewCount()).toBe(2);
    expect(state.tasks().find((task) => task.id === 'OF-007')).toMatchObject({
      columnId: 'done',
      priority: 'low',
      bookmarked: true,
    });
  });

  it('mueve y reordena sin duplicar tareas', async () => {
    const state = await readyState();
    state.setOrder('priority');
    state.moveTask({ id: 'OF-001', columnId: 'todo', beforeId: 'OF-004' });
    await saved(state);
    expect(
      state
        .tasks()
        .filter((task) => task.columnId === 'todo')
        .sort((a, b) => a.positionY - b.positionY)
        .map((task) => task.id),
    ).toEqual(['OF-001', 'OF-004', 'OF-005', 'OF-006']);
    expect(state.sortOrder()).toBe('manual');
    expect(new Set(state.tasks().map((task) => task.id)).size).toBe(11);
  });

  it('confirma los comentarios con identidad del proyecto y descarta texto vacío', async () => {
    const state = await readyState();
    const previous = state.tasks()[0].comments.length;
    state.addComment('OF-001', '   ');
    await saved(state);
    expect(state.tasks()[0].comments).toHaveLength(previous);
    state.addComment('OF-001', '  Listo para revisar  ');
    await saved(state);
    expect(state.tasks()[0].comments.at(-1)).toMatchObject({
      author: state.project()!.currentUser.name,
      text: 'Listo para revisar',
    });
  });

  it('recupera la carga después de un error y permite reintentar', async () => {
    const source = TestBed.inject(KANBAN_SERVICE_TOKEN);
    vi.spyOn(source, 'readBoard').mockReturnValueOnce(
      throwError(() => new Error('Fallo de lectura')),
    );
    const state = TestBed.inject(KanbanStateService);
    expect(state.loading()).toBe(false);
    expect(state.view()).toBeNull();
    expect(state.error()).toContain('cargar');
    state.dispatch({ type: 'loadRetried' });
    expect(state.loading()).toBe(true);
    await readyState();
    expect(state.error()).toBe('');
  });

  it('alterna reacciones desde el servicio sin alterar otros comentarios', async () => {
    const state = await readyState();
    const first = state.tasks()[0];
    const comment = first.comments[0];
    const others = structuredClone(first.comments.slice(1));
    const change = { taskId: first.id, commentId: comment.id, emoji: '👍' };
    state.dispatch({ type: 'commentReactionChanged', change });
    await saved(state);
    expect(state.tasks()[0].comments[0].reactions).toContainEqual({
      emoji: '👍',
      count: 1,
      reacted: true,
    });
    state.dispatch({ type: 'commentReactionChanged', change });
    await saved(state);
    expect(state.tasks()[0].comments[0].reactions).toEqual(comment.reactions);
    expect(state.tasks()[0].comments.slice(1)).toEqual(others);
  });

  it('libera el bloqueo al fallar un guardado y permite corregirlo', async () => {
    const state = await readyState();
    state.createTask({ ...state.initialDraft()!, title: ' ' });
    await saved(state);
    expect(state.error()).toContain('guardar');
    expect(state.tasks()).toHaveLength(11);
    state.createTask({ ...state.initialDraft()!, title: 'Corregida' });
    await saved(state);
    expect(state.error()).toBe('');
    expect(state.tasks()).toHaveLength(12);
  });

  it('cancela las suscripciones y escrituras pendientes al destruir la vista', async () => {
    const source = TestBed.inject(KANBAN_SERVICE_TOKEN);
    const state = await readyState();
    state.createTask({ ...state.initialDraft()!, title: 'No debe guardarse' });
    TestBed.resetTestingModule();
    expect((await firstValueFrom(source.readBoard())).tasks).toHaveLength(11);
  });
});

describe('Demora del mock con tiempo virtual', () => {
  it('espera 400 ms y no ejecuta comandos sin suscripción o tras cancelarla', () => {
    const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    scheduler.run(() => {
      const source = new KanbanMockServiceImpl();
      const emission = vi.fn();
      source.readBoard().subscribe(emission);
      source.createTask({
        title: 'Sin suscripción',
        description: '',
        columnId: 'todo',
        priority: 'low',
      });
      const canceled = source
        .createTask({ title: 'Cancelada', description: '', columnId: 'todo', priority: 'low' })
        .subscribe();
      scheduler.schedule(() => canceled.unsubscribe(), 200);
      scheduler.schedule(() => expect(emission).not.toHaveBeenCalled(), 399);
      scheduler.schedule(() => {
        expect(emission).toHaveBeenCalledTimes(1);
        expect(emission.mock.calls[0][0].tasks).toHaveLength(11);
      }, 400);
    });
  });
});
