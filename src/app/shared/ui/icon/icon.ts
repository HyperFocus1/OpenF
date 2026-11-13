import { Component, computed, input } from '@angular/core';

const paths = {
  plus: 'M12 5v14M5 12h14',
  sliders: 'M4 6h5m4 0h7M4 18h7m4 0h5M9 3v6m6 6v6M4 12h11m4 0h1M15 9v6',
  sparkles: 'M12 1l2.8 4.2 5-1-1 5L23 12l-4.2 2.8 1 5-5-1L12 23l-2.8-4.2-5 1 1-5L1 12l4.2-2.8-1-5 5 1Z',
  burst: 'M12 1l2.8 4.2 5-1-1 5L23 12l-4.2 2.8 1 5-5-1L12 23l-2.8-4.2-5 1 1-5L1 12l4.2-2.8-1-5 5 1Z',
  send: 'm4 5 16 7-16 7 3-7-3-7Zm3 7h13',
  brand: 'M9 4H6a2 2 0 0 0-2 2v3m0 6v3a2 2 0 0 0 2 2h3m6 0h3a2 2 0 0 0 2-2v-3m0-6V6a2 2 0 0 0-2-2h-3M10 17V8h7m-7 4h5',
  kanban: 'M4 4h4v16H4ZM10 4h4v10h-4ZM16 4h4v14h-4Z',
  tree: 'M9 3h6v5H9ZM3 16h5v5H3ZM16 16h5v5h-5ZM12 8v4M5.5 16v-4h13v4',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  checklist: 'm3 6 2 2 4-4M12 6h9M3 14l2 2 4-4m3 2h9M3 21h6m3 0h9',
  projects: 'M8 5a3 3 0 1 0 6 0a3 3 0 0 0-6 0ZM3 18a3 3 0 1 0 6 0a3 3 0 0 0-6 0Zm12 0a3 3 0 1 0 6 0a3 3 0 0 0-6 0Z',
  calendar: 'M3 4h18v17H3ZM3 10h18M9 4v17m6-17v17',
  apps: 'M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01',
  user: 'M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0Zm-4 14v-2a8 8 0 0 1 16 0v2',
  logout: 'M9 4H4v16h5m5-12 4 4-4 4m-5-4h12',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm7 0a3 3 0 1 0 6 0a3 3 0 0 0-6 0Z',
  'eye-off': 'm3 3 18 18M10.5 5.1c.5-.1 1-.1 1.5-.1 6.5 0 10 7 10 7a19 19 0 0 1-3.4 4.2M6.2 6.3A21 21 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5.6-1.5M9.9 9.9a3 3 0 0 0 4.2 4.2',
  close: 'm6 6 12 12M6 18 18 6',
  'arrow-right': 'M4 12h16m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  alert: 'M12 8v5m0 4h.01M12 3 2 21h20Z',
} as const;
export type IconName = keyof typeof paths;

@Component({
  selector: 'of-icon',
  template: '<svg viewBox="0 0 24 24" [attr.fill]="fill()" stroke="currentColor" [attr.stroke-width]="name() === \'apps\' ? 4 : 1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path [attr.d]="path()" /></svg>',
  styles: [':host{display:inline-flex;width:var(--of-icon-size,22px);height:var(--of-icon-size,22px);flex:none;align-items:center;justify-content:center}svg{width:100%;height:100%;overflow:visible}'],
})
export class Icon {
  readonly filled = input(false);
  readonly name = input.required<IconName>();
  protected readonly fill = computed(() => this.filled() || this.name() === 'burst' ? 'currentColor' : 'none');
  protected readonly path = computed(() => paths[this.name()]);
}
