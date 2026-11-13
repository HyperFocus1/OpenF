import { makeEnvironmentProviders } from '@angular/core';
import { AuthMockServiceImpl } from '@core/services/auth/auth-mock-impl.service';
import { AUTH_SERVICE_TOKEN } from './tokens';

/** Replaced at build time: mock never registers HttpClient or HTTP interceptors. */
export function provideAuth() {
  return makeEnvironmentProviders([
    { provide: AUTH_SERVICE_TOKEN, useClass: AuthMockServiceImpl },
  ]);
}
