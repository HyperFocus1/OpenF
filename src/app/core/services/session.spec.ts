import { TestBed } from '@angular/core/testing';
import { SESSION_GATEWAY } from '../../config/tokens';
import { Session } from './session';
import { SessionGateway } from './session-gateway';

describe('Estado de sesión independiente del transporte', () => {
  const user = { id: 1, email: 'persona@example.test', name: 'Persona', lastName: 'Prueba' };
  let gateway: SessionGateway;
  let session: Session;

  beforeEach(() => {
    gateway = { read: vi.fn(async () => user), login: vi.fn(async () => user),
      register: vi.fn(async () => user), logout: vi.fn(async () => undefined) };
    TestBed.configureTestingModule({ providers: [{ provide: SESSION_GATEWAY, useValue: gateway }] });
    session = TestBed.inject(Session);
  });

  it('comparte una sola inicialización entre guards simultáneos', async () => {
    const first = session.ensureInitialized();
    expect(session.ensureInitialized()).toBe(first);
    await first;
    expect(gateway.read).toHaveBeenCalledTimes(1);
    expect(session.user()).toEqual(user);
  });

  it('permite recuperar el acceso después de un fallo inicial de red', async () => {
    vi.mocked(gateway.read).mockRejectedValueOnce(new Error('offline'));
    await session.ensureInitialized();
    expect(session.authenticated()).toBe(false);
    await session.login({ email: user.email, password: 'password' });
    expect(session.authenticated()).toBe(true);
  });

  it('conserva el usuario cuando falla logout y lo borra al confirmarse', async () => {
    await session.refresh();
    vi.mocked(gateway.logout).mockRejectedValueOnce(new Error('forbidden'));
    await expect(session.logout()).rejects.toThrow('forbidden');
    expect(session.user()).toEqual(user);
    await session.logout();
    expect(session.user()).toBeNull();
  });

  it('no restaura una lectura antigua después de limpiar la sesión', async () => {
    let resolve!: (value: typeof user) => void;
    vi.mocked(gateway.read).mockReturnValueOnce(new Promise(done => { resolve = done; }));
    const pending = session.refresh();
    session.clear();
    resolve(user);
    await pending;
    expect(session.authenticated()).toBe(false);
  });

  it('una lectura anterior no reemplaza un login más reciente', async () => {
    let resolve!: (value: null) => void;
    vi.mocked(gateway.read).mockReturnValueOnce(new Promise(done => { resolve = done; }));
    const pending = session.refresh();
    await session.login({ email: user.email, password: 'password' });
    resolve(null);
    await pending;
    expect(session.user()).toEqual(user);
  });
});
