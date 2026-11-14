import { Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { AssistantProfile } from '@models/assistant/assistant.model';
import { AssistantService } from './assistant.service';

/** Local assistant data. No HTTP, browser storage or animation state. */
@Injectable()
export class AssistantMockServiceImpl implements AssistantService {
  private static readonly MOCK_DELAY_MS = 400;
  private static readonly MOCK_PROFILE: AssistantProfile = {
    name: 'Atlas',
    greeting: { message: '¡Hola! Estoy aquí para ayudarte.', durationMs: 2400 },
    welcomeDurationMs: 1600,
    travelDurationMs: 850,
    defaultPosition: { x: 1, y: 1 },
    routes: [
      { path: '/app/tree', position: { x: 0.05, y: 1 } },
      { path: '/app/kanban', position: { x: 0.92, y: 0.94 } },
    ],
  };

  readProfile(): Observable<AssistantProfile> {
    return timer(AssistantMockServiceImpl.MOCK_DELAY_MS).pipe(
      map(() => structuredClone(AssistantMockServiceImpl.MOCK_PROFILE)),
    );
  }
}
