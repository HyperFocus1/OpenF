import { TestBed } from '@angular/core/testing';
import { AUTH_SERVICE_TOKEN } from '@configs/tokens';
import { SessionService } from '@core/services/auth/session.service';
import { AuthService } from '@core/services/auth/auth.service';

describe('Estado de sesión independiente del transporte', () => {
  const user = { id: 1, email: 'persona@example.test', name: 'Persona', lastName: 'Prueba' };
  let auth: AuthService;
  let session: SessionService;

  beforeEach(() => {
    auth = { restoreSession: vi.fn(async () => user), login: vi.fn(async () => user),
      register: vi.fn(async () => user), logout: vi.fn(async () => undefined) };
    TestBed.configureTestingModule({ providers: [{ provide: AUTH_SERVICE_TOKEN, useValue: auth }] });
    session = TestBed.inject(SessionService);
  });

  it('comparte una sola inicialización entre guards simultáneos', async () => {
    const first = session.ensureInitialized();
    expect(session.ensureInitialized()).toBe(first);
    await first;
    expect(auth.restoreSession).toHaveBeenCalledTimes(1);
    expect(session.user()).toEqual(user);
  });

  it('permite recuperar el acceso después de un fallo inicial de red', async () => {
    vi.mocked(auth.restoreSession).mockRejectedValueOnce(new Error('offline'));
    await session.ensureInitialized();
    expect(session.authenticated()).toBe(false);
    await session.login({ email: user.email, password: 'password' });
    expect(session.authenticated()).toBe(true);
  });

  it('conserva el usuario cuando falla logout y lo borra al confirmarse', async () => {
    await session.refresh();
    vi.mocked(auth.logout).mockRejectedValueOnce(new Error('forbidden'));
    await expect(session.logout()).rejects.toThrow('forbidden');
    expect(session.user()).toEqual(user);
    await session.logout();
    expect(session.user()).toBeNull();
  });

  it('no restaura una lectura antigua después de limpiar la sesión', async () => {
    let resolve!: (value: typeof user) => void;
    vi.mocked(auth.restoreSession).mockReturnValueOnce(new Promise(done => { resolve = done; }));
    const pending = session.refresh();
    session.clear();
    resolve(user);
    await pending;
    expect(session.authenticated()).toBe(false);
  });

  it('una lectura anterior no reemplaza un login más reciente', async () => {
    let resolve!: (value: null) => void;
    vi.mocked(auth.restoreSession).mockReturnValueOnce(new Promise(done => { resolve = done; }));
    const pending = session.refresh();
    await session.login({ email: user.email, password: 'password' });
    resolve(null);
    await pending;
    expect(session.user()).toEqual(user);
  });
});
