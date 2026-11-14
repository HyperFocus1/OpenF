import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { ASSISTANT_SERVICE_TOKEN } from '@configs/tokens';
import { AssistantStateService } from '@core/services/assistant/assistant-state.service';
import { AssistantProfile } from '@models/assistant/assistant.model';

const PROFILE: AssistantProfile = {
  name: 'Ada',
  greeting: { message: 'Hola desde el proveedor.', durationMs: 120 },
  welcomeDurationMs: 200,
  travelDurationMs: 500,
  defaultPosition: { x: 1, y: 1 },
  routes: [
    { path: '/app/tree', position: { x: 0.2, y: 0.8 } },
    { path: '/app/kanban', position: { x: 0.7, y: 0.9 } },
  ],
};

function setup(
  url = '/app/home',
  readProfile: () => Observable<AssistantProfile> = () => of(PROFILE),
) {
  const events = new Subject<NavigationEnd>();
  const source = { readProfile: vi.fn(readProfile) };
  TestBed.configureTestingModule({
    providers: [
      { provide: Router, useValue: { url, events } },
      { provide: ASSISTANT_SERVICE_TOKEN, useValue: source },
    ],
  });
  return { assistant: TestBed.inject(AssistantStateService), events, source };
}

describe('Coordinador del asistente', () => {
  it('muestra el actor solo en el espacio de trabajo y reacciona a la navegación', () => {
    const { assistant, events } = setup('/login');
    expect(assistant.view().visible).toBe(false);
    events.next(new NavigationEnd(1, '/app/tree', '/app/tree'));
    expect(assistant.view()).toMatchObject({
      visible: true,
      state: 'success',
      position: { x: 0.2, y: 0.8 },
    });
    events.next(new NavigationEnd(2, '/app/home', '/app/home'));
    expect(assistant.view()).toMatchObject({
      state: 'moving',
      direction: 'right',
      position: { x: 1, y: 1 },
    });
    events.next(new NavigationEnd(3, '/login', '/login'));
    expect(assistant.view().visible).toBe(false);
    expect(assistant.view().state).toBe('idle');
  });

  it('limita posiciones y tiempos y conserva ocultación y pausa entre eventos', () => {
    const { assistant, events } = setup();
    assistant.dispatch({ type: 'move', position: { x: -20, y: 5 }, durationMs: 50000 });
    expect(assistant.view()).toMatchObject({
      position: { x: 0, y: 1 },
      durationMs: 10000,
      direction: 'left',
    });
    assistant.dispatch({ type: 'visibility', visible: false });
    assistant.dispatch({ type: 'pause', paused: true });
    events.next(new NavigationEnd(1, '/app/kanban', '/app/kanban'));
    expect(assistant.view()).toMatchObject({ visible: false, paused: true });
    assistant.dispatch({ type: 'move', position: { x: NaN, y: Infinity } });
    expect(assistant.view().position).toEqual({ x: 0.7, y: 0.9 });
    assistant.dispatch({ type: 'reset' });
    expect(assistant.view()).toMatchObject({ visible: true, paused: false, state: 'idle' });
  });

  it('espera los datos y aplica el perfil a la última ruta sin fijar contenido en el coordinador', () => {
    const profiles = new Subject<AssistantProfile>();
    const { assistant, events, source } = setup('/app/home', () => profiles);
    expect(assistant.view().visible).toBe(false);
    events.next(new NavigationEnd(1, '/app/tree/branch?view=all', '/app/tree/branch?view=all'));
    profiles.next(PROFILE);
    expect(assistant.view()).toMatchObject({ visible: true, position: { x: 0.2, y: 0.8 } });
    expect(assistant.label()).toBe('Saludar a Ada, asistente de OpenF');
    assistant.dispatch({ type: 'greet' });
    expect(assistant.view()).toMatchObject({ state: 'success', message: PROFILE.greeting.message });
    events.next(new NavigationEnd(2, '/app/home', '/app/home'));
    expect(assistant.view().durationMs).toBe(PROFILE.travelDurationMs);
    expect(source.readProfile).toHaveBeenCalledOnce();
    TestBed.resetTestingModule();
    expect(profiles.observed).toBe(false);
  });

  it('un fallo al cargar el perfil no impide procesar los eventos de UI', () => {
    const { assistant } = setup('/login', () => throwError(() => new Error('Sin perfil')));
    assistant.dispatch({ type: 'state', state: 'thinking' });
    expect(assistant.view()).toMatchObject({ state: 'thinking', visible: false });
    assistant.dispatch({ type: 'greet' });
    expect(assistant.view().message).toBe('');
  });

  it('un evento posterior cancela la reacción temporal sin sobrescribir el estado nuevo', () => {
    const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    scheduler.run(() => {
      const { assistant } = setup('/login');
      assistant.dispatch({ type: 'state', state: 'error', durationMs: 100 });
      scheduler.schedule(() => assistant.dispatch({ type: 'state', state: 'thinking' }), 50);
      scheduler.schedule(() => expect(assistant.view().state).toBe('thinking'), 101);
      scheduler.schedule(
        () => assistant.dispatch({ type: 'state', state: 'success', durationMs: 100 }),
        120,
      );
      scheduler.schedule(() => expect(assistant.view().state).toBe('success'), 219);
      scheduler.schedule(() => expect(assistant.view().state).toBe('idle'), 221);
    });
  });
});
