import { Component } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'of-alert',
  imports: [Icon],
  template: '<of-icon name="alert" /><div><ng-content /></div>',
  host: { role: 'alert' },
  styles: [':host{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border:1px solid var(--of-error-outline);border-radius:12px;background:var(--of-error-background);color:var(--of-error);font-size:13px;line-height:20px}of-icon{--of-icon-size:18px;margin-top:1px}'],
})
export class Alert {}
