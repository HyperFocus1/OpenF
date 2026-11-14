import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { defer, filter, Subscription, timer } from 'rxjs';
import { ASSISTANT_SERVICE_TOKEN } from '@configs/tokens';
import {
  AssistantEvent,
  AssistantPosition,
  AssistantProfile,
  AssistantView,
} from '@models/assistant/assistant.model';

const DEFAULT_VIEW: AssistantView = {
  state: 'idle',
  position: { x: 1, y: 1 },
  direction: 'right',
  durationMs: 700,
  visible: true,
  paused: false,
  message: '',
};

/** App-wide UI coordinator. Commands update signals once; CSS performs all frame playback. */
@Service()
export class AssistantStateService {
  private readonly source = inject(ASSISTANT_SERVICE_TOKEN);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly current = signal<AssistantView>(DEFAULT_VIEW);
  private readonly workspace = signal(false);
  private readonly profile = signal<AssistantProfile | null>(null);
  private path = '';
  private reaction: Subscription | undefined;
  readonly label = computed(() => `Saludar a ${this.profile()?.name ?? ''}, asistente de OpenF`);
  readonly view = computed<AssistantView>(() => ({
    ...this.current(),
    visible: this.profile() !== null && this.current().visible && this.workspace(),
  }));

  constructor() {
    this.onNavigation(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.onNavigation(event.urlAfterRedirects));
    defer(() => this.source.readProfile())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          if (this.workspace()) this.navigateProfile(false);
        },
        error: () => this.profile.set(null),
      });
    this.destroyRef.onDestroy(() => this.reaction?.unsubscribe());
  }

  dispatch(event: AssistantEvent): void {
    switch (event.type) {
      case 'greet': {
        const greeting = this.profile()?.greeting;
        if (greeting) this.dispatch({ type: 'state', state: 'success', ...greeting });
        break;
      }
      case 'move': {
        this.reaction?.unsubscribe();
        const previous = this.current();
        const position = {
          x: this.coordinate(event.position.x, previous.position.x),
          y: this.coordinate(event.position.y, previous.position.y),
        };
        const durationMs = this.duration(event.durationMs, 700);
        this.current.update((view) => ({
          ...view,
          position,
          durationMs,
          state: 'moving',
          message: '',
          direction:
            position.x < view.position.x
              ? 'left'
              : position.x > view.position.x
                ? 'right'
                : view.direction,
        }));
        this.returnToIdle(durationMs);
        break;
      }
      case 'state':
        this.reaction?.unsubscribe();
        this.current.update((view) => ({
          ...view,
          state: event.state,
          message: event.message ?? '',
        }));
        if (event.durationMs !== undefined)
          this.returnToIdle(this.duration(event.durationMs, 1800));
        break;
      case 'visibility':
        this.current.update((view) => ({ ...view, visible: event.visible }));
        break;
      case 'pause':
        this.current.update((view) => ({ ...view, paused: event.paused }));
        break;
      case 'reset':
        this.reaction?.unsubscribe();
        this.current.set({
          ...DEFAULT_VIEW,
          position: this.profile()?.defaultPosition ?? DEFAULT_VIEW.position,
        });
        break;
    }
  }

  private onNavigation(url: string): void {
    this.path = url.split(/[?#]/)[0];
    const wasWorkspace = this.workspace();
    const workspace = this.path === '/app' || this.path.startsWith('/app/');
    this.workspace.set(workspace);
    if (!workspace) {
      this.dispatch({ type: 'state', state: 'idle' });
      return;
    }
    this.navigateProfile(wasWorkspace);
  }

  private navigateProfile(continuing: boolean): void {
    const profile = this.profile();
    if (!profile) return;
    const target =
      profile.routes.find(
        (route) => this.path === route.path || this.path.startsWith(route.path + '/'),
      )?.position ?? profile.defaultPosition;
    const previous = this.current().position;
    const position: AssistantPosition = {
      x: this.coordinate(target.x, previous.x),
      y: this.coordinate(target.y, previous.y),
    };
    if (continuing) this.dispatch({ type: 'move', position, durationMs: profile.travelDurationMs });
    else {
      this.current.update((view) => ({ ...view, position }));
      this.dispatch({ type: 'state', state: 'success', durationMs: profile.welcomeDurationMs });
    }
  }

  private returnToIdle(delayMs: number): void {
    this.reaction = timer(delayMs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.current.update((view) => ({ ...view, state: 'idle', message: '' })));
  }
  private coordinate(value: number, fallback: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
  }
  private duration(value: number | undefined, fallback: number): number {
    return value !== undefined && Number.isFinite(value)
      ? Math.max(0, Math.min(10000, value))
      : fallback;
  }
}
