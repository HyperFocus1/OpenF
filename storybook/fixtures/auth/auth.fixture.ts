import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { AuthMockServiceImpl } from '@core/services/auth/auth-mock-impl.service';
import {
  LoginRequest,
  RegisterRequest,
  SessionFailure,
  SessionUser,
} from '@models/auth/auth.model';

export type AuthScenario =
  'guest' | 'authenticated' | 'invalid-credentials' | 'email-taken' | 'slow' | 'offline';
export const demoCredentials = { email: 'demo@openf.local', password: 'OpenF1234!' };

/** The only auth transport provided in the catalog. Never registers HttpClient. */
@Injectable()
export class AuthFixture implements AuthService {
  private implementation = new AuthMockServiceImpl();
  private scenario: AuthScenario = 'guest';
  private needsSeed = false;

  configure(scenario: AuthScenario): void {
    this.implementation = new AuthMockServiceImpl();
    this.scenario = scenario;
    this.needsSeed = scenario === 'authenticated';
  }

  async restoreSession(): Promise<SessionUser | null> {
    if (this.needsSeed) {
      this.needsSeed = false;
      await this.implementation.login(demoCredentials);
    }
    return this.implementation.restoreSession();
  }

  async login(request: LoginRequest): Promise<SessionUser> {
    await this.beforeRequest();
    if (this.scenario === 'invalid-credentials') throw new SessionFailure('invalid-credentials');
    return this.implementation.login(request);
  }

  async register(request: RegisterRequest): Promise<SessionUser> {
    await this.beforeRequest();
    if (this.scenario === 'email-taken') throw new SessionFailure('email-taken');
    return this.implementation.register(request);
  }

  logout(): Promise<void> {
    return this.implementation.logout();
  }

  private async beforeRequest(): Promise<void> {
    if (this.scenario === 'slow') await new Promise<void>((resolve) => setTimeout(resolve, 1800));
    if (this.scenario === 'offline') throw new HttpErrorResponse({ status: 0 });
  }
}
