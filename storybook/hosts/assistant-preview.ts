import { provideLocationMocks } from '@angular/common/testing';
import { afterNextRender, Component, inject } from '@angular/core';
import { provideRouter, Router, withDisabledInitialNavigation } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { AssistantStateService } from '@core/services/assistant/assistant-state.service';
import { provideAssistant } from '@configs/assistant.providers';
import { AssistantHost } from '@layout/assistant/assistant-host';
import { Button } from '@shared/ui';

@Component({
  selector: 'book-assistant-preview',
  imports: [AssistantHost, Button],
  template: `
    <main class="min-h-dvh bg-canvas p-8 text-content compact:p-5">
      <h1 class="text-2xl font-medium">Asistente global</h1>
      <p class="mt-3 max-w-lg text-sm leading-6 text-content-muted">
        Prueba los eventos del coordinador. La misma instancia se desplaza y cambia de estado.
      </p>
      <div class="mt-6 flex max-w-2xl flex-wrap gap-3">
        <button
          ofButton="secondary"
          size="sm"
          (click)="assistant.dispatch({ type: 'move', position: { x: 0, y: 0.7 } })"
        >
          Ir a la izquierda
        </button>
        <button
          ofButton="secondary"
          size="sm"
          (click)="assistant.dispatch({ type: 'move', position: { x: 1, y: 1 } })"
        >
          Ir a la derecha
        </button>
        <button
          ofButton="secondary"
          size="sm"
          (click)="assistant.dispatch({ type: 'state', state: 'thinking' })"
        >
          Pensar
        </button>
        <button
          ofButton="secondary"
          size="sm"
          (click)="
            assistant.dispatch({
              type: 'state',
              state: 'success',
              message: '¡Listo!',
              durationMs: 2200,
            })
          "
        >
          Celebrar
        </button>
        <button
          ofButton="secondary"
          size="sm"
          (click)="assistant.dispatch({ type: 'pause', paused: !assistant.view().paused })"
        >
          {{ assistant.view().paused ? 'Reanudar' : 'Pausar' }}
        </button>
        <button ofButton="ghost" size="sm" (click)="assistant.dispatch({ type: 'reset' })">
          Restablecer
        </button>
      </div>
    </main>
    <of-app-assistant />
  `,
  host: { style: '--of-rail-width: 0px' },
})
export class AssistantPreview {
  protected readonly assistant = inject(AssistantStateService);
  constructor() {
    const router = inject(Router);
    afterNextRender(() => {
      void router.navigateByUrl('/app');
    });
  }
}

export const assistantPreviewProviders = applicationConfig({
  providers: [
    provideRouter([{ path: 'app', children: [] }], withDisabledInitialNavigation()),
    provideLocationMocks(),
    provideAssistant(),
  ],
});
