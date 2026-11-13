import { provideLocationMocks } from '@angular/common/testing';
import { Component, effect, inject, input, untracked } from '@angular/core';
import {
  provideRouter,
  Router,
  RouterOutlet,
  withDisabledInitialNavigation,
} from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import { routes } from '../../src/app/app.routes';
import { AUTH_SERVICE_TOKEN } from '@configs/tokens';
import { SessionService } from '@core/services/auth/session.service';
import { AuthFixture, AuthScenario } from '../fixtures/auth/auth.fixture';

@Component({
  selector: 'book-route-preview',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  host: { '(click)': 'routeAnchor($event)' },
})
export class RoutePreview {
  readonly path = input('/login');
  readonly scenario = input<AuthScenario>('guest');
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly fixture = inject(AuthFixture);

  constructor() {
    effect(() => {
      const path = this.path();
      const scenario = this.scenario();
      untracked(() => {
        this.fixture.configure(scenario);
        this.session.clear();
        void this.router.navigateByUrl(path);
      });
    });
  }

  /** Keep ordinary app links inside the isolated router instead of leaving the catalog iframe. */
  protected routeAnchor(event: MouseEvent): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = event.target instanceof Element ? event.target.closest('a') : null;
    const href = anchor?.getAttribute('href');
    if (href !== '/login' && href !== '/register') return;
    event.preventDefault();
    void this.router.navigateByUrl(href);
  }
}

export const routePreviewProviders = applicationConfig({
  providers: [
    provideRouter(routes, withDisabledInitialNavigation()),
    provideLocationMocks(),
    AuthFixture,
    { provide: AUTH_SERVICE_TOKEN, useExisting: AuthFixture },
  ],
});
