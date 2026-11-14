import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { provideAssistant } from '@configs/assistant.providers';
import { ASSISTANT_SERVICE_TOKEN } from '@configs/tokens';
import { AssistantMockServiceImpl } from '@core/services/assistant/assistant-mock-impl.service';

describe('Contrato mock del asistente', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideAssistant(),
        {
          provide: HttpClient,
          useFactory: () => {
            throw new Error('El asistente mock no debe usar HTTP');
          },
        },
      ],
    }),
  );

  it('resuelve el mock mediante el token y emite después de la latencia simulada', () => {
    const source = TestBed.inject(ASSISTANT_SERVICE_TOKEN);
    expect(source).toBeInstanceOf(AssistantMockServiceImpl);
    const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    scheduler.run(() => {
      const received = vi.fn();
      const complete = vi.fn();
      source.readProfile().subscribe({ next: received, complete });
      expect(received).not.toHaveBeenCalled();
      scheduler.schedule(() => expect(received).not.toHaveBeenCalled(), 399);
      scheduler.schedule(() => {
        expect(received).toHaveBeenCalledOnce();
        expect(received.mock.calls[0][0].name).toBe('Atlas');
        expect(complete).toHaveBeenCalledOnce();
      }, 401);
    });
  });

  it('cada lectura devuelve una copia independiente de las constantes internas', async () => {
    const source = TestBed.inject(ASSISTANT_SERVICE_TOKEN);
    const first = await firstValueFrom(source.readProfile());
    Object.assign(first.greeting, { message: 'Cambio externo' });
    Object.assign(first.routes[0].position, { x: 0.99 });
    const second = await firstValueFrom(source.readProfile());
    expect(second.greeting.message).toBe('¡Hola! Estoy aquí para ayudarte.');
    expect(second.routes[0].position.x).toBe(0.05);
    expect(second).not.toBe(first);
  });
});
