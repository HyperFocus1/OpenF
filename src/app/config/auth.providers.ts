import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { makeEnvironmentProviders } from '@angular/core';
import { authApiInterceptor } from '@core/interceptors/auth-api.interceptor';
import { AuthApiServiceImpl } from '@core/services/auth/auth-api-impl.service';
import { AUTH_SERVICE_TOKEN } from './tokens';

export function provideAuth() {
  return makeEnvironmentProviders([
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'OPENF-XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([authApiInterceptor]),
    ),
    { provide: AUTH_SERVICE_TOKEN, useClass: AuthApiServiceImpl },
  ]);
}
