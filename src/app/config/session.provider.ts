import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { makeEnvironmentProviders } from '@angular/core';
import { sessionInterceptor } from '../core/interceptors/session-interceptor';
import { HttpSessionGateway } from '../core/services/http-session-gateway';
import { SESSION_GATEWAY } from './tokens';

export function provideSessionGateway() {
  return makeEnvironmentProviders([
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'OPENF-XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([sessionInterceptor]),
    ),
    { provide: SESSION_GATEWAY, useClass: HttpSessionGateway },
  ]);
}
