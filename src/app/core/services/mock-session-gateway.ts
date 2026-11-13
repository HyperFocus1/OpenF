import { Injectable } from '@angular/core';
import { LoginRequest, RegisterRequest, SessionFailure, SessionUser } from '../models/session';
import { SessionGateway } from './session-gateway';

interface DemoAccount { user: SessionUser; password: string; }

/** Ephemeral demo only. No HTTP, cookies, tokens or browser storage. Reload resets it. */
@Injectable()
export class MockSessionGateway implements SessionGateway {
  private readonly accounts: DemoAccount[] = [{
    user: { id: 1, email: 'demo@openf.local', name: 'Demo', lastName: 'OpenF' },
    password: 'OpenF1234!',
  }];
  private currentUser: SessionUser | null = null;

  async read(): Promise<SessionUser | null> {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  async login(request: LoginRequest): Promise<SessionUser> {
    const account = this.accounts.find(item => item.user.email === request.email.trim().toLowerCase());
    if (!account || account.password !== request.password) throw new SessionFailure('invalid-credentials');
    this.currentUser = { ...account.user };
    return { ...this.currentUser };
  }

  async register(request: RegisterRequest): Promise<SessionUser> {
    const email = request.email.trim().toLowerCase();
    if (this.accounts.some(item => item.user.email === email)) throw new SessionFailure('email-taken');
    const user = { id: this.accounts.length + 1, email, name: request.name.trim(), lastName: request.last_name.trim() };
    this.accounts.push({ user, password: request.password });
    this.currentUser = { ...user };
    return { ...user };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }
}
