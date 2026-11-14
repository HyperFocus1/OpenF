import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AssistantHost } from '@layout/assistant/assistant-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AssistantHost],
  template: '<router-outlet /><of-app-assistant />',
})
export class App {}
