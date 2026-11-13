import { Component, signal } from '@angular/core';
import { Button, Popover } from '@shared/ui';

@Component({
  selector: 'book-popover-preview',
  imports: [Button, Popover],
  template: `<button
      ofButton="secondary"
      popovertarget="book-account"
      [attr.aria-expanded]="open()"
      aria-controls="book-account"
    >
      Abrir opciones
    </button>
    <of-popover popoverId="book-account" label="Cuenta de ejemplo" (toggled)="open.set($event)">
      <h2 class="text-xl font-medium">Demo OpenF</h2>
      <p class="mt-2 text-sm">demo@openf.local</p>
      <button
        ofButton="ghost"
        class="mt-4 text-inherit"
        popovertarget="book-account"
        popovertargetaction="hide"
      >
        Cerrar opciones
      </button>
    </of-popover>`,
})
export class PopoverPreview {
  protected readonly open = signal(false);
}
