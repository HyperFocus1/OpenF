import { Component, input } from '@angular/core';
import { BrandMark } from '@shared/ui';

@Component({
  selector: 'of-auth-layout',
  imports: [BrandMark],
  templateUrl: './auth-layout.html',
  host: { class: 'block' },
})
export class AuthLayout {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
}
