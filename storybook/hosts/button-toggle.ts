import { Component, signal } from '@angular/core';
import { Button, IconButton } from '@shared/ui';

@Component({
  selector: 'book-button-toggle',
  imports: [Button, IconButton],
  template: `<div class="openf-storybook-stack">
    <button
      ofButton="secondary"
      icon="checklist"
      [toggle]="true"
      [active]="selected()"
      (click)="selected.update((value) => !value)"
    >
      Lista
    </button>
    <of-icon-button
      icon="home"
      label="Favorito"
      kind="navigation"
      size="lg"
      shape="circle"
      variant="secondary"
      [toggle]="true"
      [active]="selected()"
      (pressed)="selected.update((value) => !value)"
    />
    <p role="status">{{ selected() ? 'Seleccionado' : 'Sin seleccionar' }}</p>
  </div>`,
})
export class ButtonToggle {
  protected readonly selected = signal(false);
}
