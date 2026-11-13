import { ApplicationConfig } from '@angular/core';
import { environment } from './environment';
import { provideSessionGateway } from './session.provider';
import { API_URL } from './tokens';

export const globalConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: environment.apiUrl },
    provideSessionGateway(),
  ],
};
