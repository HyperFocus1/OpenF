import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('@layout/shell/shell').then(component => component.Shell),
    canActivateChild: [authGuard],
    children: [
      { path: 'home', title: 'Home', loadComponent: () => import('@features/home/home').then(component => component.Home) },
      { path: 'kanban', title: 'Kanban', loadComponent: () => import('@features/kanban/kanban').then(component => component.Kanban) },
      { path: 'tree', title: 'Tree', loadComponent: () => import('@features/tree/tree').then(component => component.Tree) },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  {
    path: '',
    loadChildren: () => import('@features/auth/auth.router').then(feature => feature.AUTH_ROUTES),
  },
  { path: '**', redirectTo: 'login' },
];
