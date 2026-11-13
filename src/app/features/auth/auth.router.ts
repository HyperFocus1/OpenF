import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/login/login').then(component => component.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/register/register').then(component => component.Register),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
