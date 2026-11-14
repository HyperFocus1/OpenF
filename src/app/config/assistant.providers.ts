import { makeEnvironmentProviders } from '@angular/core';
import { AssistantMockServiceImpl } from '@core/services/assistant/assistant-mock-impl.service';
import { ASSISTANT_SERVICE_TOKEN } from './tokens';

/** The assistant uses local data in every build until an API implementation is available. */
export function provideAssistant() {
  return makeEnvironmentProviders([
    { provide: ASSISTANT_SERVICE_TOKEN, useClass: AssistantMockServiceImpl },
  ]);
}
