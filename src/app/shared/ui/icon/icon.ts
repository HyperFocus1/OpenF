import { Component, computed, input } from '@angular/core';
import { OPENF_MARK_PATH } from '../brand-mark/brand-mark.paths';

const paths = {
  expand: 'M8 3H3v5m13 13h5v-5M3 3l7 7m11 11-7-7',
  collapse: 'M3 10h7V3m11 11h-7v7M3 3l7 7m11 11-7-7',
  reply: 'm9 5-6 6 6 6M3 11h10a7 7 0 0 1 7 7',
  smile: 'M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0ZM8 9h.01M16 9h.01M8 14s1 3 4 3 4-3 4-3',
  lock: 'M5 10h14v11H5ZM8 10V6a4 4 0 0 1 8 0v4m-4 5v2',
  star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',
  plus: 'M12 5v14M5 12h14',
  sliders: 'M4 6h5m4 0h7M4 18h7m4 0h5M9 3v6m6 6v6M4 12h11m4 0h1M15 9v6',
  sparkles:
    'M12 1l2.8 4.2 5-1-1 5L23 12l-4.2 2.8 1 5-5-1L12 23l-2.8-4.2-5 1 1-5L1 12l4.2-2.8-1-5 5 1Z',
  burst:
    'M12 1l2.8 4.2 5-1-1 5L23 12l-4.2 2.8 1 5-5-1L12 23l-2.8-4.2-5 1 1-5L1 12l4.2-2.8-1-5 5 1Z',
  send: 'm4 5 16 7-16 7 3-7-3-7Zm3 7h13',
  brand: OPENF_MARK_PATH,
  kanban: 'M4 4h4v16H4ZM10 4h4v10h-4ZM16 4h4v14h-4Z',
  tree: 'M9 3h6v5H9ZM3 16h5v5H3ZM16 16h5v5h-5ZM12 8v4M5.5 16v-4h13v4',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  checklist: 'm3 6 2 2 4-4M12 6h9M3 14l2 2 4-4m3 2h9M3 21h6m3 0h9',
  projects:
    'M8 5a3 3 0 1 0 6 0a3 3 0 0 0-6 0ZM3 18a3 3 0 1 0 6 0a3 3 0 0 0-6 0Zm12 0a3 3 0 1 0 6 0a3 3 0 0 0-6 0Z',
  calendar: 'M3 4h18v17H3ZM3 10h18M9 4v17m6-17v17',
  apps: 'M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01',
  user: 'M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0Zm-4 14v-2a8 8 0 0 1 16 0v2',
  logout: 'M9 4H4v16h5m5-12 4 4-4 4m-5-4h12',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm7 0a3 3 0 1 0 6 0a3 3 0 0 0-6 0Z',
  'eye-off':
    'm3 3 18 18M10.5 5.1c.5-.1 1-.1 1.5-.1 6.5 0 10 7 10 7a19 19 0 0 1-3.4 4.2M6.2 6.3A21 21 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5.6-1.5M9.9 9.9a3 3 0 0 0 4.2 4.2',
  close: 'm6 6 12 12M6 18 18 6',
  'arrow-right': 'M4 12h16m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  alert: 'M12 8v5m0 4h.01M12 3 2 21h20Z',
  search: 'm21 21-5-5M3 10a7 7 0 1 0 14 0a7 7 0 0 0-14 0Z',
  list: 'M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01',
  folder: 'M3 7V5h6l2 2h10v13H3Z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  check: 'm5 12 4 4L19 6',
  'check-circle': 'm8 12 3 3 5-6M21 12a9 9 0 1 1-5-8',
  circle: 'M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z',
  flag: 'M5 21V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0',
  chart: 'M5 20v-5m7 5V9m7 11V3',
  tag: 'M3 3h8l10 10-8 8L3 11ZM7 7h.01',
  link: 'm10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 2 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  bookmark: 'M6 3h12v18l-6-4-6 4Z',
  file: 'M14 3H5v18h14V8Zm0 0v5h5M8 13h8m-8 4h5',
  message: 'M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3ZM7 8h10M7 12h7',
  mail: 'M3 5h18v14H3Zm0 1 9 7 9-7',
  money: 'M12 2v20m5-16H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H5',
  clock: 'M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0ZM12 7v5l3 2',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  arrow: 'm7 17 10-10M7 7h10v10',
  pen: 'm15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z',
} as const;
export type IconName = keyof typeof paths;
export function isIconName(value: string): value is IconName {
  return Object.hasOwn(paths, value);
}

@Component({
  selector: 'of-icon',
  template:
    '<svg [attr.viewBox]="name() === \'brand\' ? \'0 0 32 32\' : \'0 0 24 24\'" [attr.fill]="fill()" [attr.stroke]="name() === \'brand\' ? \'none\' : \'currentColor\'" [attr.stroke-width]="name() === \'apps\' ? 4 : 1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path [attr.d]="path()" [attr.fill-rule]="name() === \'brand\' ? \'evenodd\' : null" /></svg>',
  styles: [
    ':host{display:inline-flex;width:var(--of-icon-size,22px);height:var(--of-icon-size,22px);flex:none;align-items:center;justify-content:center}svg{width:100%;height:100%;overflow:visible}',
  ],
})
export class Icon {
  readonly filled = input(false);
  readonly name = input.required<IconName>();
  protected readonly fill = computed(() =>
    this.filled() || this.name() === 'burst' || this.name() === 'brand' ? 'currentColor' : 'none',
  );
  protected readonly path = computed(() => paths[this.name()]);
}
