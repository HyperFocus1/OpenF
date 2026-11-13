import { makeEnvironmentProviders } from '@angular/core';
import { MockSessionGateway } from '../core/services/mock-session-gateway';
import { SESSION_GATEWAY } from './tokens';

/** Replaced at build time: mock never registers HttpClient or HTTP interceptors. */
export function provideSessionGateway() {
  return makeEnvironmentProviders([
    { provide: SESSION_GATEWAY, useClass: MockSessionGateway },
  ]);
}
