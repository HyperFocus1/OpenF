import { DOCUMENT, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AssistantDirection,
  AssistantSprites,
  AssistantState,
  AssistantVariant,
  OPENF_ASSISTANT_SPRITES,
} from './assistant-sprite.types';

function bounded(value: number, fallback: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

/** Sprite playback stays in CSS; Angular only reacts to inputs and visibility changes. */
@Component({
  selector: 'of-assistant-sprite',
  imports: [NgOptimizedImage, NgTemplateOutlet],
  templateUrl: './assistant-sprite.html',
  styleUrl: './assistant-sprite.css',
  host: {
    class: 'inline-flex shrink-0 align-middle',
    '[attr.data-state]': 'state()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-direction]': 'direction()',
    '[attr.data-paused]': 'paused() || !inView() || documentHidden()',
    '[attr.aria-hidden]': 'decorative() && !interactive() ? "true" : null',
    '[style.--assistant-size]': 'renderSize() + "px"',
    '[style.--assistant-speed]': 'playbackSpeed()',
    '[style.--assistant-rows]': 'variant() === "eye" ? 1 : 4',
    '(document:visibilitychange)': 'documentHidden.set(document.hidden)',
  },
})
export class AssistantSprite {
  readonly state = input<AssistantState>('idle');
  readonly variant = input<AssistantVariant>('character');
  readonly direction = input<AssistantDirection>('right');
  readonly size = input(96);
  readonly speed = input(1);
  readonly paused = input(false);
  readonly interactive = input(false);
  readonly disabled = input(false);
  readonly decorative = input(false);
  readonly label = input('Asistente de OpenF');
  readonly sprites = input<AssistantSprites>(OPENF_ASSISTANT_SPRITES);
  readonly activated = output<void>();
  protected readonly document = inject(DOCUMENT);
  protected readonly documentHidden = signal(this.document.hidden);
  protected readonly inView = signal(true);
  protected readonly renderSize = computed(() => bounded(this.size(), 96, 24, 256));
  protected readonly playbackSpeed = computed(() => bounded(this.speed(), 1, 0.25, 3));
  protected readonly atlas = computed(() => this.sprites()[this.variant()]);
  /** Recreate only the image node when switching to an atlas with different dimensions. */
  protected readonly images = computed(() => [this.atlas()]);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const observer = new IntersectionObserver(
        ([entry]) => this.inView.set(entry.isIntersecting),
        { rootMargin: '40px' },
      );
      observer.observe(element.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
