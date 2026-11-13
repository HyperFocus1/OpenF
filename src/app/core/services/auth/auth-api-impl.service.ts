import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '@configs/tokens';
import { LoginRequest, RegisterRequest, SessionFailure, SessionResponse, SessionUser } from '@models/auth/auth.model';
import { AuthService } from './auth.service';

@Injectable()
export class AuthApiServiceImpl implements AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_URL).replace(/\/$/, '') + '/session';

  async restoreSession(): Promise<SessionUser | null> {
    try {
      return (await firstValueFrom(this.http.get<SessionResponse>(this.url))).user;
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 401) return null;
      throw error;
    }
  }

  login(request: LoginRequest): Promise<SessionUser> {
    return this.authenticate('login', request);
  }

  register(request: RegisterRequest): Promise<SessionUser> {
    return this.authenticate('register', request);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>(this.url + '/logout', {}));
    } catch (error: unknown) {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) throw error;
    }
  }

  private async authenticate(action: 'login' | 'register', request: LoginRequest | RegisterRequest): Promise<SessionUser> {
    // Always obtain the current anonymous session and CSRF cookie before a mutation.
    await this.restoreSession();
    const result = await firstValueFrom(this.http.post<SessionResponse>(this.url + '/' + action, request));
    if (!result.user) throw new SessionFailure('invalid-response');
    return result.user;
  }
}
