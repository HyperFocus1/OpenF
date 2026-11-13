import { booleanAttribute, Component, input, model, output } from '@angular/core';
import { IconButton } from '../icon-button/icon-button';
import { IconName } from '../icon/icon';

@Component({
  selector: 'of-prompt-input',
  imports: [IconButton],
  templateUrl: './prompt-input.html',
  styleUrl: './prompt-input.css',
})
export class PromptInput {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly placeholder = input('¿Qué quieres ajustar?');
  readonly leadingIcon = input<IconName>('burst');
  readonly leadingLabel = input('Opciones de IA');
  readonly sendIcon = input<IconName>('send');
  readonly sendLabel = input('Enviar mensaje');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });
  readonly submitted = output<string>();
  readonly leadingPressed = output<void>();

  protected update(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.value.set(target.value);
  }

  protected submit(event: SubmitEvent): void {
    event.preventDefault();
    const text = this.value().trim();
    if (!text || this.disabled() || this.busy()) return;
    this.submitted.emit(text);
  }
}
