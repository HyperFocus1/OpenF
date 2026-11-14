import { TestBed } from '@angular/core/testing';
import { AssistantSprite } from '@shared/ui';

describe('AssistantSprite del DS', () => {
  it('renderiza y emite con inputs sin servicios de la aplicación y admite el ojo aislado', () => {
    const fixture = TestBed.createComponent(AssistantSprite);
    fixture.componentRef.setInput('interactive', true);
    fixture.componentRef.setInput('state', 'thinking');
    fixture.componentRef.setInput('size', 128);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.dataset['state']).toBe('thinking');
    expect(root.style.getPropertyValue('--assistant-size')).toBe('128px');
    expect(root.querySelector('img')?.getAttribute('src')).toContain('assistant-sprite.webp');
    const activated = vi.fn();
    fixture.componentInstance.activated.subscribe(activated);
    root.querySelector('button')!.click();
    expect(activated).toHaveBeenCalledOnce();
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('variant', 'eye');
    fixture.detectChanges();
    expect(root.querySelector('img')?.getAttribute('src')).toContain('assistant-eye-sprite.webp');
    root.querySelector('button')!.click();
    expect(activated).toHaveBeenCalledOnce();
  });

  it('expone la pausa, limita los tamaños y oculta las imágenes decorativas del lector', () => {
    const fixture = TestBed.createComponent(AssistantSprite);
    fixture.componentRef.setInput('size', 2000);
    fixture.componentRef.setInput('speed', 0);
    fixture.componentRef.setInput('paused', true);
    fixture.componentRef.setInput('decorative', true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.style.getPropertyValue('--assistant-size')).toBe('256px');
    expect(root.style.getPropertyValue('--assistant-speed')).toBe('0.25');
    expect(root.dataset['paused']).toBe('true');
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('button')).toBeNull();
    expect(root.querySelector('img')?.getAttribute('alt')).toBe('');
  });
});
