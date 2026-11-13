import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '../../core/services/session';
import { authError } from '../../core/auth/auth-error';
import { Button, Icon, IconButton, IconName } from '../../shared/ui';
import { Popover } from '../../shared/ui/popover/popover';

interface NavigationItem { label: string; icon: IconName; active: boolean; }

@Component({
  selector: 'of-sidebar',
  imports: [Button, Icon, IconButton, Popover],
  templateUrl: './sidebar.html',
  host: { class: 'block' },
})
export class Sidebar {
  protected readonly session = inject(Session);
  private readonly router = inject(Router);
  protected readonly menuOpen = signal(false);
  protected readonly signingOut = signal(false);
  protected readonly error = signal('');
  protected readonly items: readonly NavigationItem[] = [
    { label: 'Inicio', icon: 'home', active: true },
    { label: 'Tareas', icon: 'checklist', active: false },
    { label: 'Proyectos', icon: 'projects', active: false },
    { label: 'Semanas', icon: 'calendar', active: false },
  ];

  protected async logout(): Promise<void> {
    this.signingOut.set(true);
    this.error.set('');
    try {
      await this.session.logout();
      await this.router.navigateByUrl('/login');
    } catch (error: unknown) {
      this.error.set(authError(error));
    } finally {
      this.signingOut.set(false);
    }
  }
}
