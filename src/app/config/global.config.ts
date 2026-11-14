import { ApplicationConfig } from '@angular/core';
import { environment } from './environment';
import { provideAuth } from './auth.providers';
import { API_URL } from './tokens';
import { provideAssistant } from './assistant.providers';

export const globalConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: environment.apiUrl },
    provideAuth(),
    provideAssistant(),
  ],
};
