import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('@layout/shell/shell').then(component => component.Shell),
  },
  {
    path: '',
    loadChildren: () => import('@features/auth/auth.router').then(feature => feature.AUTH_ROUTES),
  },
  { path: '**', redirectTo: 'login' },
];
