import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '@configs/tokens';
import { provideAuth } from '@configs/auth.providers';
import { SessionService } from '@core/services/auth/session.service';

describe('Sesión HTTP con cookies', () => {
  const user = { id: 1, email: 'persona@example.test', name: 'Persona', lastName: 'Prueba' };
  let session: SessionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideRouter([]),
      provideAuth(),
      provideHttpClientTesting(),
      { provide: API_URL, useValue: '/api' },
    ] });
    session = TestBed.inject(SessionService);
    http = TestBed.inject(HttpTestingController);
    document.cookie = 'OPENF-XSRF-TOKEN=csrf-test; Path=/';
  });
  afterEach(() => {
    http.verify();
    document.cookie = 'OPENF-XSRF-TOKEN=; Max-Age=0; Path=/';
  });

  it('obtiene CSRF antes de login y envía cookies sin Bearer', async () => {
    const credentials = { email: user.email, password: 'password' };
    const login = session.login(credentials);
    const bootstrap = http.expectOne('/api/session');
    expect(bootstrap.request.withCredentials).toBe(true);
    bootstrap.flush({ user: null });
    await Promise.resolve();
    await Promise.resolve();
    const request = http.expectOne('/api/session/login');
    expect(request.request.body).toEqual(credentials);
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-test');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ user });
    await login;
    expect(session.user()).toEqual(user);
  });

  it('envía el contrato de registro existente y rechaza respuestas sin usuario', async () => {
    const data = { name: 'Persona', last_name: 'Prueba', email: user.email, password: 'password' };
    const registration = session.register(data);
    const rejected = expect(registration).rejects.toMatchObject({ code: 'invalid-response' });
    http.expectOne('/api/session').flush({ user: null });
    await Promise.resolve();
    await Promise.resolve();
    const request = http.expectOne('/api/session/register');
    expect(request.request.body).toEqual(data);
    request.flush({ user: null });
    await rejected;
    expect(session.authenticated()).toBe(false);
  });

  it('permite login cuando la lectura inicial responde como sesión anónima con 401', async () => {
    const login = session.login({ email: user.email, password: 'password' });
    http.expectOne('/api/session').flush({}, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();
    await Promise.resolve();
    http.expectOne('/api/session/login').flush({ user });
    await login;
    expect(session.user()).toEqual(user);
  });

  it('conserva la sesión si logout recibe 403, y acepta 401 como sesión expirada', async () => {
    const refresh = session.refresh();
    http.expectOne('/api/session').flush({ user });
    await refresh;
    const logout = session.logout();
    const rejected = expect(logout).rejects.toBeInstanceOf(HttpErrorResponse);
    http.expectOne('/api/session/logout').flush({}, { status: 403, statusText: 'Forbidden' });
    await rejected;
    expect(session.authenticated()).toBe(true);
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const expired = session.logout();
    http.expectOne('/api/session/logout').flush({}, { status: 401, statusText: 'Unauthorized' });
    await expired;
    expect(session.authenticated()).toBe(false);
  });

  it('limpia una sesión expirada y redirige sin enviar cookies a otros orígenes', async () => {
    const refresh = session.refresh();
    http.expectOne('/api/session').flush({ user });
    await refresh;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const client = TestBed.inject(HttpClient);
    for (const url of ['https://example.test/api/private', '/api-external/private']) {
      const pending = firstValueFrom(client.get(url));
      const request = http.expectOne(url);
      expect(request.request.withCredentials).toBe(false);
      expect(request.request.headers.has('X-XSRF-TOKEN')).toBe(false);
      request.flush({});
      await pending;
    }
    const pending = firstValueFrom(client.get('/api/private'));
    const rejected = expect(pending).rejects.toBeInstanceOf(HttpErrorResponse);
    http.expectOne('/api/private').flush({}, { status: 401, statusText: 'Unauthorized' });
    await rejected;
    expect(session.authenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
