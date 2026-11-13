import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconButton } from '@shared/ui';

@Component({
  imports: [IconButton],
  template: `<of-icon-button icon="plus" label="Action" variant="secondary"
    [disabled]="disabled()" [busy]="busy()" [unavailable]="unavailable()" (pressed)="actions.set(actions() + 1)" />`,
})
class InteractionHarness {
  readonly disabled = signal(false);
  readonly busy = signal(false);
  readonly unavailable = signal(false);
  readonly actions = signal(0);
}

describe('Interacción compartida de botones', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [InteractionHarness] });
  });
  afterEach(() => vi.useRealTimers());

  const setup = () => {
    const fixture = TestBed.createComponent(InteractionHarness);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, button };
  };
  const down = (button: HTMLButtonElement, mouseButton = 0) => button.dispatchEvent(new MouseEvent('pointerdown', {
    bubbles: true, button: mouseButton, clientX: 12, clientY: 16,
  }));

  it('muestra la onda tras un clic rápido y la retira después de la salida', () => {
    const { button } = setup();
    down(button);
    expect(button.querySelector('.of-state-layer')?.getAttribute('aria-hidden')).toBe('true');
    expect(button.querySelectorAll('.of-ripple')).toHaveLength(1);
    button.dispatchEvent(new Event('pointerup'));
    vi.advanceTimersByTime(224);
    expect(button.querySelector('.of-ripple-leaving')).toBeNull();
    vi.advanceTimersByTime(1);
    expect(button.querySelector('.of-ripple-leaving')).not.toBeNull();
    vi.advanceTimersByTime(375);
    expect(button.querySelector('.of-ripple')).toBeNull();
  });

  it('responde al teclado sin duplicar ondas al mantener Espacio', () => {
    const { button } = setup();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true }));
    expect(button.querySelectorAll('.of-ripple')).toHaveLength(1);
    button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    vi.advanceTimersByTime(600);
    expect(button.querySelector('.of-ripple')).toBeNull();
  });

  for (const state of ['disabled', 'busy', 'unavailable'] as const) {
    it(`bloquea efectos y acciones cuando el control está ${state}`, () => {
      const { fixture, button } = setup();
      fixture.componentInstance[state].set(true);
      fixture.detectChanges();
      down(button);
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(button.querySelector('.of-ripple')).toBeNull();
      expect(fixture.componentInstance.actions()).toBe(0);
    });
  }

  it('ignora el botón derecho y limpia las ondas al destruir el componente', () => {
    const { fixture, button } = setup();
    down(button, 2);
    expect(button.querySelector('.of-ripple')).toBeNull();
    down(button);
    button.dispatchEvent(new Event('pointercancel'));
    fixture.destroy();
    vi.runAllTimers();
    expect(button.querySelector('.of-state-layer')).toBeNull();
  });
});
