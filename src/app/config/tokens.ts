import { InjectionToken } from '@angular/core';
import type { AuthService } from '@core/services/auth/auth.service';
import type { KanbanService } from '@core/services/kanban/kanban.service';
import type { AssistantService } from '@core/services/assistant/assistant.service';

export const API_URL = new InjectionToken<string>('OpenF API URL');
export const AUTH_SERVICE_TOKEN = new InjectionToken<AuthService>('OpenF authentication service');
export const KANBAN_SERVICE_TOKEN = new InjectionToken<KanbanService>('OpenF Kanban data service');
export const ASSISTANT_SERVICE_TOKEN = new InjectionToken<AssistantService>(
  'OpenF assistant data service',
);
