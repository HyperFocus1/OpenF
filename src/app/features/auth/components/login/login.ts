import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { email, form, FormField as SignalField, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '@core/services/auth/session.service';
import { authError } from '@shared/utils/auth-error';
import { Alert, Button, FormField, IconButton, Input } from '@shared/ui';
import { AuthLayout } from '../../auth-layout';
import { AssistantStateService } from '@core/services/assistant/assistant-state.service';

@Component({
  selector: 'of-login',
  imports: [AuthLayout, Alert, Button, FormField, IconButton, Input, SignalField, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  protected readonly assistant = inject(AssistantStateService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');
  protected readonly model = signal({ email: '', password: '' });
  protected readonly loginForm = form(this.model, (path) => {
    required(path.email, { message: 'Introduce tu correo.' });
    email(path.email, { message: 'Introduce un correo válido.' });
    required(path.password, { message: 'Introduce tu contraseña.' });
  });
  protected readonly showPassword = signal(false);
  protected readonly serverError = signal('');
  protected readonly emailError = computed(() => {
    const field = this.loginForm.email();
    return field.touched() ? (field.errors()[0]?.message ?? null) : null;
  });
  protected readonly passwordError = computed(() => {
    const field = this.loginForm.password();
    return field.touched() ? (field.errors()[0]?.message ?? null) : null;
  });

  protected fieldFocus(field: 'email' | 'password'): void {
    if (!this.loginForm().submitting())
      this.assistant.dispatch({ type: 'state', state: field === 'password' ? 'sleeping' : 'idle' });
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.serverError.set('');
    let success = false;
    await submit(this.loginForm, {
      action: async () => {
        this.assistant.dispatch({ type: 'state', state: 'thinking' });
        try {
          const value = this.model();
          await this.session.login({ email: value.email.trim(), password: value.password });
          success = true;
          this.assistant.dispatch({ type: 'state', state: 'success', durationMs: 1600 });
          this.model.set({ email: '', password: '' });
          await this.router.navigateByUrl('/app');
        } catch (error: unknown) {
          this.serverError.set(authError(error));
          this.assistant.dispatch({ type: 'state', state: 'error', durationMs: 2200 });
        }
      },
    });
    if (!success && this.loginForm().invalid()) {
      const name = this.loginForm.email().invalid() ? 'email' : 'password';
      this.formElement()
        .nativeElement.querySelector<HTMLInputElement>('#login-' + name)
        ?.focus();
    }
  }
}
