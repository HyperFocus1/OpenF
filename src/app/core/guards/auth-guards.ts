import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session } from '../services/session';

export const authGuard: CanActivateFn = async () => {
  const session = inject(Session);
  const router = inject(Router);
  await session.ensureInitialized();
  return session.authenticated() || router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async () => {
  const session = inject(Session);
  const router = inject(Router);
  await session.ensureInitialized();
  return !session.authenticated() || router.createUrlTree(['/app']);
};
