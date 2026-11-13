import { computed, inject, Service, signal } from '@angular/core';
import { SESSION_GATEWAY } from '../../config/tokens';
import { LoginRequest, RegisterRequest, SessionUser } from '../models/session';

@Service()
export class Session {
  private readonly gateway = inject(SESSION_GATEWAY);
  private readonly userState = signal<SessionUser | null>(null);
  private initialized: Promise<void> | undefined;
  private revision = 0;
  readonly user = this.userState.asReadonly();
  readonly authenticated = computed(() => this.user() !== null);

  ensureInitialized(): Promise<void> {
    return this.initialized ??= this.refresh().catch(() => undefined);
  }

  async refresh(): Promise<void> {
    const revision = ++this.revision;
    const user = await this.gateway.read();
    if (revision === this.revision) this.userState.set(user);
  }

  async login(request: LoginRequest): Promise<void> {
    const revision = ++this.revision;
    const user = await this.gateway.login(request);
    if (revision === this.revision) this.accept(user);
  }

  async register(request: RegisterRequest): Promise<void> {
    const revision = ++this.revision;
    const user = await this.gateway.register(request);
    if (revision === this.revision) this.accept(user);
  }

  async logout(): Promise<void> {
    await this.gateway.logout();
    this.clear();
  }

  clear(): void {
    ++this.revision;
    this.userState.set(null);
    this.initialized = undefined;
  }

  private accept(user: SessionUser): void {
    this.userState.set(user);
    this.initialized = Promise.resolve();
  }
}
