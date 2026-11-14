import { Component, inject } from '@angular/core';
import { AssistantStateService } from '@core/services/assistant/assistant-state.service';
import { AssistantSprite } from '@shared/ui';

/** One persistent actor for all workspace routes; dialogs remain above it. */
@Component({
  selector: 'of-app-assistant',
  imports: [AssistantSprite],
  template: `
    @if (assistant.view(); as view) {
      @if (view.visible) {
        <div
          class="assistant-stage"
          [attr.data-paused]="view.paused"
          [style.--assistant-x]="view.position.x"
          [style.--assistant-y]="view.position.y"
          [style.--assistant-travel]="view.durationMs + 'ms'"
        >
          @if (view.message) {
            <p
              role="status"
              class="assistant-message"
              [class.message-start]="view.position.x < 0.5"
            >
              {{ view.message }}
            </p>
          }
          <of-assistant-sprite
            [state]="view.state"
            [direction]="view.direction"
            [paused]="view.paused"
            [size]="96"
            [interactive]="true"
            [label]="assistant.label()"
            (activated)="assistant.dispatch({ type: 'greet' })"
          />
        </div>
      }
    }
  `,
  styleUrl: './assistant-host.css',
  host: { class: 'pointer-events-none fixed inset-0 z-30 overflow-clip' },
})
export class AssistantHost {
  protected readonly assistant = inject(AssistantStateService);
}
