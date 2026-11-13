import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@core/services/auth/session.service';

export const guestGuard: CanActivateFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  await session.ensureInitialized();
  return !session.authenticated() || router.createUrlTree(['/app']);
};
