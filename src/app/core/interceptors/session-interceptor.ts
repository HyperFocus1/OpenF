import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../../config/tokens';
import { Session } from '../services/session';

export const sessionInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = inject(API_URL).replace(/\/$/, '');
  if (request.url !== apiUrl && !request.url.startsWith(apiUrl + '/')) return next(request);
  const session = inject(Session);
  const router = inject(Router);
  const path = request.url.slice(apiUrl.length).split('?')[0];
  return next(request.clone({ withCredentials: true })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401
        && path !== '/session' && path !== '/session/login' && path !== '/session/register') {
        session.clear();
        void router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
