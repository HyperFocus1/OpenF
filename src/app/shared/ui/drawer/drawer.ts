import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  afterRenderEffect,
  Component,
  DestroyRef,
  inject,
  input,
  model,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { IconButton } from '../icon-button/icon-button';

/** CDK Overlay + TemplatePortal with scroll blocking, a focus trap and focus restoration. */
@Component({
  selector: 'of-drawer',
  imports: [CdkTrapFocus, IconButton],
  template: `
    <ng-template #panel>
      <section
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="label()"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        [attr.data-theme]="scheme() === 'inherit' ? null : scheme()"
        class="of-drawer-panel flex h-full w-full flex-col overflow-hidden border-outline-subtle bg-surface text-content shadow-[var(--of-popover-shadow)]"
        [class]="variant() === 'compact' ? 'rounded-control border' : 'border-l'"
      >
        @if (showHeader()) {
          <header
            class="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-outline-subtle px-5 py-3 text-xs text-content-muted"
          >
            <span>{{ label() }}</span><of-icon-button
              icon="close"
              label="Cerrar panel"
              (pressed)="open.set(false)"
            />
          </header>
        }
        <div
          class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          [class]="!showHeader() ? 'p-0' : variant() === 'compact' ? 'p-4' : 'p-6 compact:p-5'"
        >
          <ng-content />
        </div>
      </section>
    </ng-template>
  `,
  styles: [
    '@media(prefers-reduced-motion:no-preference){.of-drawer-panel{animation:of-drawer-in 120ms ease-out}}@keyframes of-drawer-in{from{transform:translateX(16px)}to{transform:translateX(0)}}',
  ],
})
export class Drawer {
  readonly label = input.required<string>();
  readonly open = model(false);
  readonly variant = input<'default' | 'compact'>('default');
  readonly showHeader = input(true);
  readonly scheme = input<'inherit' | 'light' | 'dark'>('inherit');
  readonly expanded = model(false);
  private readonly overlay = inject(Overlay);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  constructor() {
    afterRenderEffect(() => {
      if (this.open() && !this.overlayRef) this.attach();
      else if (!this.open()) this.dispose();
      if (this.open()) this.overlayRef?.updateSize({ width: this.width() });
    });
    inject(DestroyRef).onDestroy(() => this.dispose());
  }

  private attach(): void {
    const compact = this.variant() === 'compact';
    const ref = this.overlay.create({
      hasBackdrop: true,
      backdropClass:
        this.scheme() === 'inherit'
          ? 'of-overlay-backdrop'
          : ['of-overlay-backdrop', 'of-overlay-backdrop-' + this.scheme()],
      positionStrategy: this.overlay
        .position()
        .global()
        .right(compact ? '8px' : '0')
        .top(compact ? '8px' : '0'),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      width: this.width(),
      height: compact ? 'min(720px, calc(100dvh - 16px))' : '100dvh',
      disposeOnNavigation: true,
    });
    this.overlayRef = ref;
    ref.attach(new TemplatePortal(this.panel(), this.viewContainer));
    ref.backdropClick().subscribe(() => this.open.set(false));
    ref.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.open.set(false);
      }
    });
  }

  private width(): string {
    if (this.variant() === 'default') return 'min(500px, 100vw)';
    return this.expanded() ? 'min(760px, calc(100vw - 16px))' : 'min(400px, calc(100vw - 16px))';
  }

  private dispose(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
