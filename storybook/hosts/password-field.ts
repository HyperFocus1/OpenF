import { Component, signal } from '@angular/core';
import { FormField, IconButton, Input } from '@shared/ui';

@Component({
  selector: 'book-password-field',
  imports: [FormField, IconButton, Input],
  template: `<of-form-field
    class="openf-storybook-field"
    label="Contraseña"
    controlId="book-password"
  >
    <input
      ofInput
      id="book-password"
      [type]="visible() ? 'text' : 'password'"
      value="OpenF1234!"
      placeholder=" "
      autocomplete="off"
    />
    <of-icon-button
      fieldEnd
      [icon]="visible() ? 'eye-off' : 'eye'"
      [label]="visible() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      [toggle]="true"
      [active]="visible()"
      (pressed)="visible.update((value) => !value)"
    />
  </of-form-field>`,
})
export class PasswordField {
  protected readonly visible = signal(false);
}
