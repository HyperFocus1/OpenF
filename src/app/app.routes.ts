import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth-guards';

export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  { path: 'app', canActivate: [authGuard], loadComponent: () => import('./layout/shell/shell').then(m => m.Shell) },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
