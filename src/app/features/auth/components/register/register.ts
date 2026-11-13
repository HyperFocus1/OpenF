import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { email, form, FormField as SignalField, minLength, required, submit, validate } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '@core/services/auth/session.service';
import { authError } from '@shared/utils/auth-error';
import { Alert, Button, FormField, IconButton, Input } from '@shared/ui';
import { AuthLayout } from '../../auth-layout';

interface Registration { name: string; lastName: string; email: string; password: string; confirmPassword: string; }
const emptyRegistration = (): Registration => ({ name: '', lastName: '', email: '', password: '', confirmPassword: '' });

@Component({
  selector: 'of-register',
  imports: [AuthLayout, Alert, Button, FormField, IconButton, Input, SignalField, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');
  protected readonly model = signal<Registration>(emptyRegistration());
  protected readonly registerForm = form(this.model, path => {
    required(path.name, { message: 'Introduce tu nombre.' });
    required(path.lastName, { message: 'Introduce tu apellido.' });
    required(path.email, { message: 'Introduce tu correo.' });
    email(path.email, { message: 'Introduce un correo válido.' });
    required(path.password, { message: 'Crea una contraseña.' });
    minLength(path.password, 8, { message: 'Utiliza al menos 8 caracteres.' });
    required(path.confirmPassword, { message: 'Repite tu contraseña.' });
    validate(path.confirmPassword, ({ value, valueOf }) => value() === valueOf(path.password)
      ? null : { kind: 'passwordMismatch', message: 'Las contraseñas no coinciden.' });
  });
  protected readonly errors = computed(() => {
    const result = {} as Record<keyof Registration, string | null>;
    for (const key of Object.keys(this.model()) as (keyof Registration)[]) {
      const field = this.registerForm[key]();
      result[key] = field.touched() ? field.errors()[0]?.message ?? null : null;
    }
    return result;
  });
  protected readonly showPassword = signal(false);
  protected readonly serverError = signal('');

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.serverError.set('');
    let success = false;
    await submit(this.registerForm, {
      action: async () => {
        try {
          const value = this.model();
          await this.session.register({ name: value.name.trim(), last_name: value.lastName.trim(),
            email: value.email.trim(), password: value.password });
          success = true;
          this.model.set(emptyRegistration());
          await this.router.navigateByUrl('/app');
        } catch (error: unknown) {
          this.serverError.set(authError(error));
        }
      },
    });
    if (!success && this.registerForm().invalid()) {
      const key = (Object.keys(this.model()) as (keyof Registration)[]).find(name => this.registerForm[name]().invalid());
      const ids: Record<keyof Registration, string> = { name: 'register-name', lastName: 'register-last-name', email: 'register-email', password: 'register-password', confirmPassword: 'register-confirm-password' };
      if (key) this.formElement().nativeElement.querySelector<HTMLInputElement>('#' + ids[key])?.focus();
    }
  }
}
