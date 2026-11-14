import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { KanbanSnapshot } from '@models/kanban/kanban.model';
import { KANBAN_SERVICE_TOKEN } from '@configs/tokens';
import { KanbanStateService } from '@core/services/kanban/kanban-state.service';
import { KanbanMockServiceImpl } from '@core/services/kanban/kanban-mock-impl.service';
import { KanbanService } from '@core/services/kanban/kanban.service';
import { Kanban } from '@features/kanban/kanban';

async function customBoard() {
  const data = await firstValueFrom(new KanbanMockServiceImpl().readBoard());
  const columnIds = ['812', '43', '509', '777'];
  data.columns = data.columns.map((column, index) => ({
    ...column,
    id: columnIds[index],
    name: ['Ideas del equipo', 'Implementación', 'Validación externa', 'Entregado'][index],
    position: 3 - index,
  }));
  data.columns.push({
    ...data.columns[0],
    id: '9001',
    name: 'Esperando al cliente',
    position: 10,
    completed: false,
    review: false,
  });
  data.tasks = data.tasks.map((task) => ({
    ...task,
    columnId: columnIds[['backlog', 'todo', 'review', 'done'].indexOf(task.columnId)],
    priority: task.priority === 'high' ? 'critical' : task.priority,
  }));
  data.priorities = data.priorities.map((priority) =>
    priority.id === 'high'
      ? { ...priority, id: 'critical', label: 'Crítica', rank: -10 }
      : priority,
  );
  data.defaults.columnId = '43';
  data.defaults.priority = 'critical';
  data.categories[0] = { ...data.categories[0], label: 'Investigación avanzada', icon: 'search' };
  data.tools[0] = { ...data.tools[0], label: 'Figma Enterprise', icon: 'unknown-server-icon' };
  return data;
}

async function stateFor(input?: KanbanSnapshot) {
  const data = input ?? (await customBoard());
  const source: KanbanService = {
    readBoard: vi.fn(() => of(structuredClone(data))),
    createTask: vi.fn(() => of(data.tasks[0])),
    updateTask: vi.fn(() => of(undefined)),
    moveTask: vi.fn(() => of(undefined)),
    addComment: vi.fn(() => of(undefined)),
    toggleCommentReaction: vi.fn(() => of(undefined)),
  };
  TestBed.configureTestingModule({
    providers: [KanbanStateService, { provide: KANBAN_SERVICE_TOKEN, useValue: source }],
  });
  return { state: TestBed.inject(KanbanStateService), source, data };
}

describe('Kanban: datos variables y vista de presentación', () => {
  it('abre, cierra y cambia de tarea sin reconstruir tarjetas, columnas ni volver a pedir datos', async () => {
    const { state, source } = await stateFor();
    const before = state.view()!;
    const first = before.tasks[0];
    const second = before.tasks[1];
    for (const task of [first, second, first]) {
      state.dispatch({ type: 'taskOpened', id: task.id });
      const opened = state.view()!;
      expect(opened.detailOpen).toBe(true);
      expect(opened.selectedTask).toBe(task);
      expect(opened.tasks).toBe(before.tasks);
      expect(opened.columns).toBe(before.columns);
      expect(opened.columnOptions).toBe(before.columnOptions);
      expect(opened.priorityOptions).toBe(before.priorityOptions);
      state.dispatch({ type: 'detailVisibilityChanged', open: false });
      expect(state.view()!.detailOpen).toBe(false);
      expect(state.view()!.columns).toBe(before.columns);
    }
    expect(source.readBoard).toHaveBeenCalledTimes(1);
  });

  it('recibe cantidad, nombres, IDs y orden de columnas, conservando las vacías', async () => {
    const { state } = await stateFor();
    const view = state.view()!;
    expect(view.columns.map((column) => column.id)).toEqual(['777', '509', '43', '812', '9001']);
    expect(view.columns.map((column) => column.label)).toContain('Esperando al cliente');
    expect(view.columns.at(-1)?.tasks).toEqual([]);
    expect(view.columns.find((column) => column.id === '812')?.tasks).toHaveLength(3);
    expect(view.summary.completed).toBe(2);
    expect(view.summary.review).toBe(3);
  });

  it('resuelve los catálogos recibidos, su orden de prioridad y símbolos desconocidos', async () => {
    const { state } = await stateFor();
    state.setOrder('priority');
    const task = state.view()!.tasks[0];
    expect(task.priority.id).toBe('critical');
    expect(task.priority.label).toBe('Crítica');
    expect(state.view()!.tasks.find((task) => task.id === 'OF-001')!.tools[0]).toMatchObject({
      label: 'Figma Enterprise',
      icon: 'tag',
    });
    state.setSearch('Investigación avanzada');
    expect(state.view()!.tasks.length).toBeGreaterThan(0);
    expect(
      state.view()!.tasks.every((task) => task.category.label === 'Investigación avanzada'),
    ).toBe(true);
  });

  it('prepara formularios y acciones con los IDs recibidos sin deducirlos por el nombre', async () => {
    const { state, source } = await stateFor();
    state.dispatch({ type: 'newTaskOpened' });
    expect(state.view()!.newTaskDraft).toMatchObject({ columnId: '43', priority: 'critical' });
    const task = state.view()!.tasks.find((task) => task.columnId === '812')!;
    expect(task.completionChanges).toEqual({ columnId: '777' });
    state.dispatch({ type: 'taskChanged', id: task.id, changes: task.completionChanges! });
    expect(source.updateTask).toHaveBeenCalledWith(task.id, { columnId: '777' });
    state.dispatch({ type: 'taskMoved', move: { id: task.id, columnId: '9001', index: 0 } });
    expect(source.moveTask).toHaveBeenCalledWith({ id: task.id, columnId: '9001', beforeId: null });
  });

  it('tolera un tablero sin columnas ni catálogos sin inventar opciones', async () => {
    const data = await customBoard();
    data.columns = [];
    data.tasks = [];
    data.priorities = [];
    data.defaults.columnId = null;
    data.defaults.priority = null;
    const { state } = await stateFor(data);
    state.dispatch({ type: 'newTaskOpened' });
    expect(state.view()!.columns).toEqual([]);
    expect(state.view()!.priorityOptions).toEqual([]);
    expect(state.view()!.createOpen).toBe(false);
    expect(state.view()!.summary.completion).toBe(0);
  });

  it('renderiza y emite intenciones recibiendo solo un view model, sin inyectar servicios de datos', async () => {
    const { state } = await stateFor();
    const view = state.view()!;
    TestBed.resetTestingModule();
    const fixture = TestBed.createComponent(Kanban);
    fixture.componentRef.setInput('view', view);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('of-kanban-board section')).toHaveLength(5);
    expect(root.textContent).toContain('Esperando al cliente');
    expect(root.textContent).toContain('Crítica');
    const received = vi.fn();
    fixture.componentInstance.action.subscribe(received);
    root
      .querySelector<HTMLButtonElement>('[aria-label="Añadir tarea en Esperando al cliente"]')!
      .click();
    expect(received).toHaveBeenCalledWith({ type: 'newTaskOpened', columnId: '9001' });
    expect(
      root.querySelector<HTMLElement>('of-kanban-board > div')?.style.gridTemplateColumns,
    ).toContain('repeat(5,');
    fixture.componentRef.setInput('view', {
      ...view,
      tasks: [],
      columns: view.columns.map((column) => ({ ...column, tasks: [] })),
      summary: { total: 0, completed: 0, review: 0, completion: 0 },
    });
    fixture.detectChanges();
    expect(root.querySelectorAll('of-kanban-board section')).toHaveLength(5);
    expect(root.querySelectorAll('of-task-card')).toHaveLength(0);
  });
});
