import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideAuth } from '@configs/auth.providers.mock';
import { SessionService } from '@core/services/auth/session.service';

describe('Demo sin transporte HTTP', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [
    provideAuth(),
    { provide: HttpClient, useFactory: () => { throw new Error('El mock no debe utilizar HTTP'); } },
  ] }));

  it('inicializa, autentica y cierra sesión sin utilizar HttpClient', async () => {
    const session = TestBed.inject(SessionService);
    await session.ensureInitialized();
    expect(session.user()).toBeNull();
    await session.login({ email: 'DEMO@openf.local', password: 'OpenF1234!' });
    expect(session.user()?.name).toBe('Demo');
    await session.logout();
    expect(session.user()).toBeNull();
  });

  it('registra, evita duplicados y permite volver a entrar en la misma ejecución', async () => {
    const session = TestBed.inject(SessionService);
    const data = { name: 'Ana', last_name: 'Pérez', email: 'ana@example.test', password: 'password' };
    await session.register(data);
    expect(session.user()?.lastName).toBe('Pérez');
    await session.logout();
    await expect(session.register({ ...data, email: 'ANA@example.test' })).rejects.toMatchObject({ code: 'email-taken' });
    await session.login(data);
    expect(session.authenticated()).toBe(true);
  });

  it('rechaza una contraseña incorrecta sin autenticar', async () => {
    const session = TestBed.inject(SessionService);
    await expect(session.login({ email: 'demo@openf.local', password: 'wrong' }))
      .rejects.toMatchObject({ code: 'invalid-credentials' });
    expect(session.authenticated()).toBe(false);
  });
});
