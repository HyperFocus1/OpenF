import { InjectionToken } from '@angular/core';
import { SessionGateway } from '../core/services/session-gateway';

export const API_URL = new InjectionToken<string>('OpenF API URL');
export const SESSION_GATEWAY = new InjectionToken<SessionGateway>('OpenF session gateway');
