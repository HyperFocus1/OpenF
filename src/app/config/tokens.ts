import { InjectionToken } from '@angular/core';
import type { AuthService } from '@core/services/auth/auth.service';

export const API_URL = new InjectionToken<string>('OpenF API URL');
export const AUTH_SERVICE_TOKEN = new InjectionToken<AuthService>('OpenF authentication service');
