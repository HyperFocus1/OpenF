import { booleanAttribute, Directive, input } from '@angular/core';

@Directive({
  selector: 'input[ofInput]',
  host: {
    class: 'of-input',
    '[class.of-input--invalid]': 'invalidState()',
  },
})
export class Input {
  readonly invalidState = input(false, { alias: 'ofInvalid', transform: booleanAttribute });
}
