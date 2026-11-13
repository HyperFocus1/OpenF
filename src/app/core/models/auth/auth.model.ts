export interface SessionUser {
  id: number;
  email: string;
  name: string;
  lastName: string;
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest extends LoginRequest { name: string; last_name: string; }
export interface SessionResponse { user: SessionUser | null; }

export type SessionFailureCode = 'invalid-credentials' | 'email-taken' | 'invalid-response';

export class SessionFailure extends Error {
  constructor(readonly code: SessionFailureCode) {
    super(code);
    this.name = 'SessionFailure';
  }
}
