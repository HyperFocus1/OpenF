import { Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/** Local portraits are optional; initials keep the component usable without a photo. */
@Component({
  selector: 'of-avatar',
  imports: [NgOptimizedImage],
  template: `@if (src(); as image) {
      <img
        [ngSrc]="image"
        width="36"
        height="36"
        alt=""
        class="size-full rounded-full object-cover"
      />
    } @else {
      {{ initials() }}
    }`,
  host: {
    role: 'img',
    class:
      'inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface bg-selected text-[9px] leading-none font-bold text-on-selected data-[tone=neutral]:bg-surface-active data-[tone=neutral]:text-content-muted data-[size=xs]:size-3.5 data-[size=xs]:text-[6px] data-[size=md]:size-9 data-[size=md]:text-[11px]',
    '[attr.aria-label]': 'name()',
    '[attr.title]': 'name()',
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
  },
})
export class Avatar {
  readonly name = input.required<string>();
  readonly src = input<string>();
  readonly size = input<'xs' | 'sm' | 'md'>('sm');
  readonly tone = input<'primary' | 'neutral'>('primary');
  protected readonly initials = computed(
    () =>
      this.name()
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || '?',
  );
}
