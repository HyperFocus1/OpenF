import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'of-shell',
  imports: [Sidebar],
  host: { class: 'block min-h-dvh bg-canvas' },
  template: `
    <a class="fixed top-3 left-28 z-[100] -translate-y-[200%] rounded-control bg-primary px-4 py-2 text-on-primary focus:translate-y-0 compact:left-22" href="/app#workspace">Saltar al contenido</a>
    <of-sidebar />
    <main id="workspace" class="ml-rail min-h-dvh outline-none" tabindex="-1" aria-label="Espacio de trabajo">
      <h1 class="sr-only">OpenF, espacio de trabajo</h1>
    </main>
  `,
})
export class Shell {}
