import { Component, input, signal } from '@angular/core';
import { Button, Drawer, Dropdown, IconName } from '@shared/ui';

@Component({
  selector: 'book-drawer-preview',
  imports: [Button, Drawer],
  template: `<button ofButton="primary" (click)="open.set(true)">Abrir detalle</button
    ><of-drawer [label]="label()" [variant]="variant()" [scheme]="scheme()" [(open)]="open"
      ><h2 class="mb-3 text-2xl font-medium">Un espacio para los detalles</h2>
      <p class="mb-6 text-sm text-content-muted">
        Panel con CDK Overlay y TemplatePortal. Escape y clic fuera cierran el panel y devuelven el
        foco.
      </p>
      <label class="flex flex-col gap-2 text-xs"
        >Nombre<input
          class="rounded-control border border-outline bg-surface p-3 text-content"
          placeholder="Nombre de la tarea" /></label
      ><button ofButton="primary" class="mt-6" (click)="open.set(false)">
        Guardar cambios
      </button></of-drawer
    >`,
})
export class DrawerPreview {
  readonly label = input('Detalle de ejemplo');
  readonly variant = input<'default' | 'compact'>('default');
  readonly scheme = input<'inherit' | 'dark' | 'light'>('inherit');
  protected readonly open = signal(false);
}

@Component({
  selector: 'book-dropdown-preview',
  imports: [Dropdown],
  template: `<of-dropdown
    [label]="label()"
    [icon]="icon()"
    [count]="count()"
    [iconOnly]="iconOnly()"
    panelId="example-filters"
    ><div class="flex flex-col gap-4">
      <h2 class="text-sm font-medium">Filtrar tareas</h2>
      <label class="flex flex-col gap-2 text-xs text-content-muted"
        >Prioridad<select class="rounded-lg border border-outline bg-surface p-2 text-content">
          <option>Todas</option>
          <option>Alta</option>
          <option>Media</option>
          <option>Baja</option>
        </select></label
      >
    </div></of-dropdown
  >`,
})
export class DropdownPreview {
  readonly label = input('Filtros');
  readonly icon = input<IconName>('sliders');
  readonly count = input(0);
  readonly iconOnly = input(false);
}
