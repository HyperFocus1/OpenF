import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionService } from '@core/services/auth/session.service';
import { Sidebar } from '../../../src/app/layout/sidebar/sidebar';

describe('Opciones de apariencia', () => {
  beforeEach(() => {
    localStorage.removeItem('openf-theme');
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: { user: signal({ name: 'Demo', email: 'demo@openf.local' }) },
        },
      ],
    });
  });

  afterEach(() => {
    localStorage.removeItem('openf-theme');
    document.documentElement.removeAttribute('data-theme');
  });

  function options() {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '[aria-label="Tema"] button',
      ),
    );
    const select = (label: string) => {
      buttons.find((button) => button.textContent?.trim() === label)!.click();
      fixture.detectChanges();
    };
    return { fixture, buttons, select };
  }

  it('usa Sistema por defecto y cambia la apariencia con tres botones de selección única', () => {
    const { buttons, select } = options();
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      'Sistema',
      'Claro',
      'Oscuro',
    ]);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.dataset['theme']).toBe('system');
    for (const [label, value] of [
      ['Claro', 'light'],
      ['Oscuro', 'dark'],
      ['Sistema', 'system'],
    ]) {
      select(label);
      expect(document.documentElement.dataset['theme']).toBe(value);
      expect(localStorage.getItem('openf-theme')).toBe(value);
      expect(
        buttons.filter((button) => button.getAttribute('aria-pressed') === 'true'),
      ).toHaveLength(1);
    }
  });

  it('conserva la selección al recrear el sidebar', () => {
    const first = options();
    first.select('Oscuro');
    first.fixture.destroy();
    document.documentElement.removeAttribute('data-theme');
    const second = options();
    expect(second.buttons[2].getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
});
