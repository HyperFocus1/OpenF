import { AfterViewInit, DestroyRef, Directive, ElementRef, inject, Renderer2 } from '@angular/core';

/** Shared pointer/keyboard state layer for native controls. */
@Directive({
  selector: '[ofRipple]',
  host: {
    class: 'of-interactive',
    '(pointerdown)': 'pointerDown($event)',
    '(pointerup)': 'release()',
    '(pointercancel)': 'release()',
    '(pointerleave)': 'release()',
    '(keydown)': 'keyDown($event)',
    '(keyup)': 'keyUp($event)',
    '(blur)': 'release()',
  },
})
export class Ripple implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private layer: HTMLSpanElement | undefined;
  private active: { element: HTMLSpanElement; startedAt: number } | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const timer of this.timers) clearTimeout(timer);
      this.timers.clear();
      if (this.layer?.parentNode) this.renderer.removeChild(this.host, this.layer);
    });
  }

  ngAfterViewInit(): void {
    this.ensureLayer();
  }

  protected pointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const box = this.host.getBoundingClientRect();
    this.start(event.clientX - box.left, event.clientY - box.top);
  }

  protected keyDown(event: KeyboardEvent): void {
    if (event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return;
    const box = this.host.getBoundingClientRect();
    this.start(box.width / 2, box.height / 2);
  }

  protected keyUp(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') this.release();
  }

  protected release(): void {
    if (!this.active) return;
    const { element, startedAt } = this.active;
    this.active = undefined;
    this.schedule(() => {
      this.renderer.addClass(element, 'of-ripple-leaving');
      this.schedule(() => {
        if (element.parentNode) this.renderer.removeChild(element.parentNode, element);
      }, 375);
    }, Math.max(0, 225 - (Date.now() - startedAt)));
  }

  private start(x: number, y: number): void {
    if (this.active || this.host.disabled || this.host.getAttribute('aria-disabled') === 'true'
      || this.host.getAttribute('aria-busy') === 'true') return;
    const opacity = getComputedStyle(this.host).getPropertyValue('--of-state-pressed-opacity').trim();
    if (opacity !== '' && Number(opacity) === 0) return;
    const box = this.host.getBoundingClientRect();
    const radius = Math.max(1, Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y)));
    const ripple = this.renderer.createElement('span') as HTMLSpanElement;
    this.renderer.addClass(ripple, 'of-ripple');
    this.renderer.setStyle(ripple, 'width', radius * 2 + 'px');
    this.renderer.setStyle(ripple, 'height', radius * 2 + 'px');
    this.renderer.setStyle(ripple, 'left', x - radius + 'px');
    this.renderer.setStyle(ripple, 'top', y - radius + 'px');
    this.renderer.appendChild(this.ensureLayer(), ripple);
    this.active = { element: ripple, startedAt: Date.now() };
  }

  private ensureLayer(): HTMLSpanElement {
    if (!this.layer) {
      this.layer = this.renderer.createElement('span') as HTMLSpanElement;
      this.renderer.addClass(this.layer, 'of-state-layer');
      this.renderer.setAttribute(this.layer, 'aria-hidden', 'true');
      this.renderer.appendChild(this.host, this.layer);
    }
    return this.layer;
  }

  private schedule(action: () => void, delay: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      action();
    }, delay);
    this.timers.add(timer);
  }
}
