import type { Observable } from 'rxjs';
import type { AssistantProfile } from '@models/assistant/assistant.model';

/** Data contract shared by the mock and the future API implementation. */
export interface AssistantService {
  readProfile(): Observable<AssistantProfile>;
}
