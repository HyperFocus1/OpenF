import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { SessionService } from '@core/services/auth/session.service';
import { authError } from '@shared/utils/auth-error';
import { Button, Icon, IconButton, IconName, Popover } from '@shared/ui';

interface NavigationItem { label: string; icon: IconName; path: string; }
type Theme = 'system' | 'light' | 'dark';

@Component({
  selector: 'of-sidebar',
  imports: [Button, Icon, IconButton, Popover],
  templateUrl: './sidebar.html',
  host: { class: 'block' },
})
export class Sidebar {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  protected readonly theme = signal<Theme>(this.initialTheme());
  protected readonly themes: readonly { value: Theme; label: string }[] = [
    { value: 'system', label: 'Sistema' },
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
  ];
  protected readonly currentPath = toSignal(this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(event => event.urlAfterRedirects.split(/[?#]/)[0]),
  ), { initialValue: this.router.url.split(/[?#]/)[0] });
  protected readonly menuOpen = signal(false);
  protected readonly signingOut = signal(false);
  protected readonly error = signal('');
  protected readonly items: readonly NavigationItem[] = [
    { label: 'Home', icon: 'home', path: '/app/home' },
    { label: 'Kanban', icon: 'kanban', path: '/app/kanban' },
    { label: 'Tree', icon: 'tree', path: '/app/tree' },
  ];

  constructor() {
    this.document.documentElement.dataset['theme'] = this.theme();
  }

  protected setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    try {
      this.document.defaultView?.localStorage.setItem('openf-theme', theme);
    } catch {
      // The selection still applies when browser storage is unavailable.
    }
  }

  private initialTheme(): Theme {
    let stored: string | null = null;
    try {
      stored = this.document.defaultView?.localStorage.getItem('openf-theme') ?? null;
    } catch {
      // Fall back to the current document theme or the system preference.
    }
    const theme = stored ?? this.document.documentElement.dataset['theme'];
    return theme === 'light' || theme === 'dark' ? theme : 'system';
  }

  protected navigate(path: string): void {
    void this.router.navigateByUrl(path);
  }

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
