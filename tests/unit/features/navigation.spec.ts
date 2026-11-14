import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../src/app/app.routes';
import { provideAuth } from '@configs/auth.providers.mock';
import { SessionService } from '@core/services/auth/session.service';

describe('Vistas y navegación del sidebar', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideAuth()] }),
  );

  it('mantiene los iconos de acción delineados al alternar la contraseña', async () => {
    const harness = await RouterTestingHarness.create('/login');
    const toggle = harness.routeNativeElement!.querySelector<HTMLButtonElement>(
      'button[aria-label="Mostrar contraseña"]',
    )!;
    toggle.click();
    harness.fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.querySelector('svg')?.getAttribute('fill')).toBe('none');
  });

  it('protege las rutas del shell y lleva a Home después de autenticar', async () => {
    const harness = await RouterTestingHarness.create('/app/tree');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/login');
    await TestBed.inject(SessionService).login({
      email: 'demo@openf.local',
      password: 'OpenF1234!',
    });
    await harness.navigateByUrl('/app');
    expect(router.url).toBe('/app/home');
    expect(harness.routeNativeElement?.querySelector('main h1')?.textContent).toBe('Hi from Home');
  });

  it('sincroniza contenido y selección al cambiar de ruta con query', async () => {
    const harness = await RouterTestingHarness.create('/login');
    await TestBed.inject(SessionService).login({
      email: 'demo@openf.local',
      password: 'OpenF1234!',
    });
    for (const [path, title] of [
      ['home', 'Home'],
      ['kanban', 'Kanban'],
      ['tree', 'Tree'],
      ['home', 'Home'],
    ]) {
      await harness.navigateByUrl('/app/' + path + '?project=demo');
      const root = harness.routeNativeElement!;
      expect(root.querySelector('main h1')?.textContent?.trim()).toBe(
        path === 'kanban' ? 'Tasks' : 'Hi from ' + title,
      );
      expect(root.querySelectorAll('button[aria-current="page"]')).toHaveLength(1);
      expect(root.querySelector('button[aria-current="page"]')?.getAttribute('aria-label')).toBe(
        title,
      );
    }
  });
});
